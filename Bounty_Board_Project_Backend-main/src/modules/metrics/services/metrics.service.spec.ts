import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from './metrics.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Sequelize } from 'sequelize-typescript';

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
        { provide: Sequelize, useValue: {} },
        { provide: CACHE_MANAGER, useValue: { get: jest.fn(), set: jest.fn() } },
      ],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
