import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { MetricsService } from '../services/metrics.service';
import { LandingStatsDto } from '../dto/landing-stats.dto';

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) { }

  @Get('landing-stats')
  @ApiOkResponse({ type: LandingStatsDto })
  landingStats() {
    return this.metricsService.landingStats();
  }
}
