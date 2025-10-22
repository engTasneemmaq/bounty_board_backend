import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  root() {
    return {
      message: 'BountyBoard API is running. See /api for documentation.'
    };
  }

  @Get('health')
  health(): { status: string } {
    return { status: 'ok' };
  }
}
