import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Bounty } from './entities/bounty.entity';
import { BountyRole } from './entities/bounty-role.entity';
import { BountyResource } from './entities/bounty-resource.entity';
import { BountyService } from './services/bounty.service';
import { BountyController } from './controllers/bounty.controller';
import { ApplicationModule } from '../application/application.module';

@Module({
    imports: [
        SequelizeModule.forFeature([Bounty, BountyRole, BountyResource]),
        ApplicationModule,
    ],
    providers: [
        BountyService,
    ],
    controllers: [
        BountyController,
    ],
    exports: [BountyService],
})
export class BountyModule { } 