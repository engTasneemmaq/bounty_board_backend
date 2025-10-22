import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class MetricsService {
  constructor(
    private readonly sequelize: Sequelize,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  async landingStats() {
    const cacheKey = 'landing-stats';
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;
    const [[row]] = await this.sequelize.query(`
      SELECT
        (SELECT COUNT(*)::INT FROM "bounties")                              AS "totalBounties",
        (SELECT COUNT(*)::INT FROM "applications")                          AS "totalApplicants",
        (SELECT COUNT(DISTINCT "hunterId")::INT FROM "applications")        AS "activeHunters",
        (SELECT COUNT(*)::INT FROM "bounties" WHERE "status" = 'completed') AS "completedProjects"
    `);
    await this.cacheManager.set(cacheKey, row, 30);
    return row;
  }
  //(SELECT COUNT(DISTINCT "hunterId")::INT FROM "applications")        AS "activeHunters",
}
