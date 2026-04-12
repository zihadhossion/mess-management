import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mess } from './mess.entity';
import { MessRepository } from './mess.repository';
import { MessService } from './mess.service';
import { MessController } from './mess.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Mess])],
  controllers: [MessController],
  providers: [MessService, MessRepository],
  exports: [MessService, MessRepository],
})
export class MessesModule {}
