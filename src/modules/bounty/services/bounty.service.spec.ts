import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { BountyService } from './bounty.service';
import { Bounty } from '../entities/bounty.entity';
import { BountyRole } from '../entities/bounty-role.entity';
import { BountyResource } from '../entities/bounty-resource.entity';
import { ApplicationService } from '../../application/services/application.service';

describe('BountyService', () => {
    let service: BountyService;
    let bountyModel: any;
    let sequelize: Sequelize;

    beforeEach(async () => {
        bountyModel = { findAndCountAll: jest.fn() };
        sequelize = { literal: jest.fn((x) => x) } as any;
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BountyService,
                { provide: getModelToken(Bounty), useValue: bountyModel },
                { provide: getModelToken(BountyRole), useValue: {} },
                { provide: getModelToken(BountyResource), useValue: {} },
                { provide: Sequelize, useValue: sequelize },
                { provide: ApplicationService, useValue: {} },
            ],
        }).compile();
        service = module.get<BountyService>(BountyService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should apply postedSince filter', async () => {
        bountyModel.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
        await service.findActiveBounties({ postedSince: 'week' } as any);
        const call = bountyModel.findAndCountAll.mock.calls[0][0];
        expect(call.where.createdAt[Op.gte]).toBe("NOW() - INTERVAL '7 days'");
    });

    it('should apply duration filter for lt1w', async () => {
        bountyModel.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
        await service.findActiveBounties({ duration: 'lt1w' } as any);
        const call = bountyModel.findAndCountAll.mock.calls[0][0];
        expect(call.where.deadline[Op.lte]).toBe("NOW() + INTERVAL '7 days'");
    });

    it('should apply duration filter for 1-2w', async () => {
        bountyModel.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
        await service.findActiveBounties({ duration: '1-2w' } as any);
        const call = bountyModel.findAndCountAll.mock.calls[0][0];
        expect(call.where.deadline[Op.lte]).toBe("NOW() + INTERVAL '14 days'");
    });

    it('should apply duration filter for 1m', async () => {
        bountyModel.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
        await service.findActiveBounties({ duration: '1m' } as any);
        const call = bountyModel.findAndCountAll.mock.calls[0][0];
        expect(call.where.deadline[Op.lte]).toBe("NOW() + INTERVAL '1 month'");
    });

    it('should apply duration filter for ongoing', async () => {
        bountyModel.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
        await service.findActiveBounties({ duration: 'ongoing' } as any);
        const call = bountyModel.findAndCountAll.mock.calls[0][0];
        expect(call.where.deadline[Op.lte]).toBe("NOW() + INTERVAL '1 year'");
    });
}); 