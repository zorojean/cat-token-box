import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TxEntity } from '../../entities/tx.entity';
import { TokenStatisticsEntity } from '../../entities/tokenstatistics.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TxEntity, TokenStatisticsEntity])],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule {}
