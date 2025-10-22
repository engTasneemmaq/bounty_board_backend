import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ApplicationService } from './application.service';
import { Application, ApplicationStatus } from '../entities/application.entity';
import { Bounty } from '../../bounty/entities/bounty.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('ApplicationService', () => {
    let service: ApplicationService;
    let applicationModel: any;
    let bountyModel: any;

    beforeEach(async () => {
        applicationModel = { findOne: jest.fn(), create: jest.fn() };
        bountyModel = { findByPk: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ApplicationService,
                { provide: getModelToken(Application), useValue: applicationModel },
                { provide: getModelToken(Bounty), useValue: bountyModel },
            ],
        }).compile();
        service = module.get<ApplicationService>(ApplicationService);
    });

    it('should throw NotFoundException if bounty does not exist', async () => {
        bountyModel.findByPk.mockResolvedValue(null);
        await expect(service.apply(1, 2)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if already applied', async () => {
        bountyModel.findByPk.mockResolvedValue({ id: 2 });
        applicationModel.findOne.mockResolvedValue({ id: 1 });
        await expect(service.apply(1, 2)).rejects.toThrow(ConflictException);
    });

    it('should create application and return message', async () => {
        bountyModel.findByPk.mockResolvedValue({ id: 2 });
        applicationModel.findOne.mockResolvedValue(null);
        applicationModel.create.mockResolvedValue({ id: 1 });
        const result = await service.apply(1, 2);
        expect(applicationModel.create).toHaveBeenCalledWith({
            hunterId: 1,
            bountyId: 2,
            status: ApplicationStatus.Pending,
        });
        expect(result).toEqual({ message: 'Application submitted' });
    });
}); 