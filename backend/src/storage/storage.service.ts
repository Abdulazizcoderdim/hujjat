import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { User } from 'src/users/schema/user.schema';
import { Repository } from 'typeorm';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3: S3Client;

  constructor(
    @InjectRepository(User) private readonly userModel: Repository<User>,
  ) {
    const endpoint = process.env.S3_ENDPOINT;
    const region = process.env.S3_REGION;
    const accessKey = process.env.S3_ACCESS_KEY;
    const secretKey = process.env.S3_SECRET_KEY;
    const publicBucket = process.env.S3_BUCKET_PUBLIC;
    const privateBucket = process.env.S3_BUCKET_PRIVATE;

    if (!endpoint || !accessKey || !secretKey) {
      throw new Error(
        '❌ S3 credentials incomplete! Check: S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY',
      );
    }

    if (!publicBucket || !privateBucket) {
      throw new Error(
        '❌ Buckets not configured! Check: S3_BUCKET_PUBLIC, S3_BUCKET_PRIVATE',
      );
    }

    this.logger.log('='.repeat(60));
    this.logger.log('🔧 Backblaze B2 S3 Configuration:');
    this.logger.log(`   Endpoint: ${endpoint}`);
    this.logger.log(`   Region: ${region}`);
    this.logger.log(`   Access Key: ${accessKey.substring(0, 10)}...`);
    this.logger.log(`   Public Bucket: ${publicBucket}`);
    this.logger.log(`   Private Bucket: ${privateBucket}`);
    this.logger.log('='.repeat(60));

    this.s3 = new S3Client({
      region: region,
      endpoint: endpoint,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true,
      maxAttempts: 5,
    });

    this.logger.log('✅ S3 Client tayyor');
  }

  async uploadBuffer(
    key: string,
    buffer: Buffer,
    contentType: string,
    isPublic: boolean = false,
  ): Promise<void> {
    const bucket = isPublic
      ? process.env.S3_BUCKET_PUBLIC!
      : process.env.S3_BUCKET_PRIVATE!;

    try {
      this.logger.log(`📤 Upload START: ${key}`);
      this.logger.log(
        `   Bucket: ${bucket} (${isPublic ? 'PUBLIC' : 'PRIVATE'})`,
      );
      this.logger.log(`   Type: ${contentType}`);
      this.logger.log(`   Size: ${(buffer.length / 1024).toFixed(2)} KB`);

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      });

      await this.s3.send(command);
      this.logger.log(`✅ Upload SUCCESS: ${key}`);
    } catch (error: any) {
      this.logger.error('='.repeat(60));
      this.logger.error(`❌ Upload FAILED: ${key}`);
      this.logger.error(`   Error: ${error.name}`);
      this.logger.error(`   Message: ${error.message}`);
      this.logger.error(`   Status: ${error.$metadata?.httpStatusCode}`);

      if (error.Code) this.logger.error(`   Code: ${error.Code}`);
      throw new InternalServerErrorException(
        `S3 upload failed: ${error.message}`,
      );
    }
  }

  async getUploadUrl(filename: string, contentType: string) {
    if (!contentType) {
      throw new BadRequestException('contentType is required');
    }

    const ext = filename.split('.').pop();
    const key = `products/files/${randomUUID()}.${ext}`;

    try {
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_PRIVATE!,
        Key: key,
        ContentType: contentType,
      });

      const uploadUrl = await getSignedUrl(this.s3, command, {
        expiresIn: 300,
      });

      this.logger.log(`🔗 Upload URL created: ${key}`);
      return { uploadUrl, key };
    } catch (error: any) {
      this.logger.error(`❌ Upload URL error: ${error.message}`);
      throw new InternalServerErrorException('S3 upload url error');
    }
  }

  async getDownloadUrl(
    key: string,
    expiresIn: number = 300,
    inline: boolean = false,
  ) {
    try {
      await this.s3.send(
        new HeadObjectCommand({
          Bucket: process.env.S3_BUCKET_PRIVATE!,
          Key: key,
        }),
      );

      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_PRIVATE!,
        Key: key,
      });

      const downloadUrl = await getSignedUrl(this.s3, command, { expiresIn });
      this.logger.log(`🔗 Download URL: ${key}`);
      return downloadUrl;
    } catch (error: any) {
      if (
        error.name === 'NotFound' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        this.logger.error(`❌ Fayl topilmadi S3'da: ${key}`);
        throw new NotFoundException(
          "Fayl topilmadi. Iltimos, admin bilan bog'laning.",
        );
      }
      this.logger.error(`❌ Download URL error: ${error.message}`);
      throw new InternalServerErrorException('S3 download url error');
    }
  }

  async upload(
    key: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<void> {
    const bucket = process.env.S3_BUCKET_PUBLIC!;

    try {
      this.logger.log(`📤 PUBLIC Upload: ${key}`);
      this.logger.log(`   Bucket: ${bucket}`);
      this.logger.log(`   Size: ${(buffer.length / 1024).toFixed(2)} KB`);

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      });

      await this.s3.send(command);
      this.logger.log(`✅ PUBLIC upload SUCCESS: ${key}`);
    } catch (error: any) {
      this.logger.error('='.repeat(60));
      this.logger.error(`❌ PUBLIC Upload FAILED: ${key}`);
      this.logger.error(`   Error: ${error.name}`);
      this.logger.error(`   Message: ${error.message}`);

      if (error.$metadata) {
        this.logger.error(`   HTTP Status: ${error.$metadata.httpStatusCode}`);
        this.logger.error(`   Request ID: ${error.$metadata.requestId}`);
      }

      if (error.Code) this.logger.error(`   AWS Code: ${error.Code}`);

      this.logger.error('='.repeat(60));

      throw new InternalServerErrorException(
        `S3 upload failed: ${error.message}`,
      );
    }
  }

  async head(key: string) {
    try {
      const command = new HeadObjectCommand({
        Bucket: process.env.S3_BUCKET_PRIVATE!,
        Key: key,
      });

      return await this.s3.send(command);
    } catch (error: any) {
      this.logger.error(`❌ Head error: ${error.message}`);
      throw new InternalServerErrorException('S3 head request failed');
    }
  }

  async deleteFile(key: string, isPublic: boolean = false) {
    const bucket = isPublic
      ? process.env.S3_BUCKET_PUBLIC!
      : process.env.S3_BUCKET_PRIVATE!;

    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await this.s3.send(command);
      this.logger.log(`🗑️ Deleted: ${key} from ${bucket}`);
    } catch (error: any) {
      this.logger.error(`❌ Delete error: ${error.message}`);
      throw new InternalServerErrorException('S3 delete failed');
    }
  }

  getPublicUrl(key: string): string {
    const endpoint = process.env.S3_PUBLIC_ENDPOINT!;
    const bucket = process.env.S3_BUCKET_PUBLIC!;

    return `${endpoint}/${key}`;
  }

  async downloadFile(key: string, isPublic: boolean = false): Promise<Buffer> {
    const bucket = isPublic
      ? process.env.S3_BUCKET_PUBLIC!
      : process.env.S3_BUCKET_PRIVATE!;

    try {
      this.logger.log(`📥 Downloading: ${key} from ${bucket}`);

      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await this.s3.send(command);
      const chunks: Uint8Array[] = [];

      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);
      this.logger.log(`✅ Downloaded: ${(buffer.length / 1024).toFixed(2)} KB`);
      return buffer;
    } catch (error: any) {
      this.logger.error(`❌ Download error: ${error.message}`);

      throw error;
    }
  }

  async getAvatarUploadUrl(userId: number) {
    const key = `avatars/users/${userId}.jpg`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_PUBLIC!,
      Key: key,
      ContentType: 'image/jpeg',
    });

    const uploadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: 300,
    });

    const publicUrl = this.getPublicUrl(key);

    await this.userModel.update(userId, { image: publicUrl });

    return { uploadUrl, publicUrl };
  }

  async getProductImageUploadUrl(filename: string, contentType: string) {
    if (!contentType || !contentType.startsWith('image/')) {
      throw new BadRequestException('Faqat rasm fayllari qabul qilinadi');
    }

    const ext = filename.split('.').pop();
    const key = `products/images/${randomUUID()}.${ext}`;

    try {
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_PUBLIC!,
        Key: key,
        ContentType: contentType,
      });

      const uploadUrl = await getSignedUrl(this.s3, command, {
        expiresIn: 300,
      });

      const publicUrl = this.getPublicUrl(key);

      this.logger.log(`🔗 Product image upload URL created: ${key}`);
      return { uploadUrl, key, publicUrl };
    } catch (error: any) {
      this.logger.error(`❌ Product image upload URL error: ${error.message}`);
      throw new InternalServerErrorException('S3 upload url error');
    }
  }
}
