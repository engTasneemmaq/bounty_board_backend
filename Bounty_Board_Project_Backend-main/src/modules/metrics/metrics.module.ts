import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MetricsService } from './services/metrics.service';
import { MetricsController } from './controller/metrics.controller';
import { CacheModule } from '@nestjs/cache-manager';


@Module({
  imports: [
    SequelizeModule.forFeature([]),
    CacheModule.register({ ttl: 30 }),
  ],
  providers: [MetricsService],
  controllers: [MetricsController],
})
export class MetricsModule { }
