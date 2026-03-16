import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/schema/user.schema';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([File, User])],
  controllers: [StorageController],
  providers: [StorageService],
})
export class StorageModule {}
