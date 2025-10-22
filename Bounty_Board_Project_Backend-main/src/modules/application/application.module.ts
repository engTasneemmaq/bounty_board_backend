import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Application } from './entities/application.entity';
import { Bounty } from '../bounty/entities/bounty.entity';
import { ApplicationService } from './services/application.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Application, Bounty]),
  ],
  providers: [ApplicationService],
  exports: [ApplicationService],
})
export class ApplicationModule { }
