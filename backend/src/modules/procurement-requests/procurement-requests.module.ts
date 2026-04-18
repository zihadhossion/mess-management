import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcurementRequest } from './procurement-request.entity';
import { ProcurementRequestService } from './procurement-request.service';
import { ProcurementRequestController } from './procurement-request.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProcurementRequest])],
  controllers: [ProcurementRequestController],
  providers: [ProcurementRequestService],
  exports: [ProcurementRequestService],
})
export class ProcurementRequestsModule {}
