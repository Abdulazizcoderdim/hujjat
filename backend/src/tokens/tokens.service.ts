import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/schema/user.schema';
import { MoreThan, Repository } from 'typeorm';
import { Token } from './schemas/token.schema';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(Token)
    private tokenRepo: Repository<Token>,
  ) {}

  async saveRefreshToken(data: {
    userId: number;
    refreshToken: string;
    expiresAt: Date;
  }) {
    const token = this.tokenRepo.create({
      user: { id: data.userId } as User,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt,
    });

    return this.tokenRepo.save(token);
  }

  async findValidToken(refreshToken: string) {
    return this.tokenRepo.findOne({
      where: {
        refreshToken,
        isRevoked: false,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user'],
    });
  }

  async revokeToken(refreshToken: string) {
    return this.tokenRepo.update({ refreshToken }, { isRevoked: true });
  }

  async revokeAllUserTokens(userId: number) {
    return this.tokenRepo.update({ user: { id: userId } }, { isRevoked: true });
  }
}
