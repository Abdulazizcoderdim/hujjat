import { Body, Controller, Post } from '@nestjs/common';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('prepare-poster')
  async preparePosterUpload(
    @Body() body: { filename: string; contentType: string },
  ) {
    return this.storageService.getProductImageUploadUrl(
      body.filename,
      body.contentType,
    );
  }
}
