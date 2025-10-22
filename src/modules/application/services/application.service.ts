import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Application, ApplicationStatus } from '../entities/application.entity';
import { Bounty } from '../../bounty/entities/bounty.entity';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectModel(Application) private readonly applicationModel: typeof Application,
    @InjectModel(Bounty) private readonly bountyModel: typeof Bounty,
  ) { }

  /** Called when a hunter clicks “Apply”. */
  async apply(hunterId: number, bountyId: number) {
    // 1️⃣  ensure bounty exists and is active
    const bounty = await this.bountyModel.findByPk(bountyId);
    if (!bounty) throw new NotFoundException('Bounty not found');

    // 2️⃣  check duplicate
    const exists = await this.applicationModel.findOne({
      where: { hunterId, bountyId },
    });
    if (exists) throw new ConflictException('You already applied to this bounty');

    // 3️⃣  create application
    await this.applicationModel.create({
      hunterId,
      bountyId,
      status: ApplicationStatus.Pending,
    } as any);

    return { message: 'Application submitted' };
  }

  /** Optional helper – number of applicants per bounty */
  async countForBounty(bountyId: number) {
    return this.applicationModel.count({ where: { bountyId } });
  }
}
