import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { BountyModule } from './modules/bounty/bounty.module';
import { ApplicationModule } from './modules/application/application.module';
import { databaseConfig } from './config/database/database.config';
import { User } from './modules/user/entities/user.entity';
import { Bounty } from './modules/bounty/entities/bounty.entity';
import { Role } from './modules/role/entities/role.entity';
// import { Application } from './modules/application/entities/application.entity';
// import { Milestone } from './modules/milestone/entities/milestone.entity';
import { Subtask } from './modules/subtask/entities/subtask.entity';
import { Notification } from './modules/notification/entities/notification.entity';
import { SharedModule } from './shared/shared.module';
import * as dotenv from 'dotenv';
import { ProfileModule } from './modules/profile/profile.module';
import { UserProfile } from './modules/profile/entities/user-profile.entity';
// import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { MetricsModule } from './modules/metrics/metrics.module';
import { CacheModule } from '@nestjs/cache-manager';
dotenv.config();
@Module({
  imports: [
    CacheModule.register(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `src/config/env/${process.env.NODE_ENV || 'development'}.env`,
    }),
    SequelizeModule.forRoot(databaseConfig),
    SequelizeModule.forFeature([
      User,
      Bounty,
      Role,
      // Application,
      // Milestone,
      Subtask,
      Notification,
      UserProfile,
    ]),
    AuthModule,
    UserModule,
    BountyModule,
    ApplicationModule,
    SharedModule,
    ProfileModule,
    ScheduleModule.forRoot(),
    MetricsModule,
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'uploads'),
    //   serveRoot: '/uploads',
    // }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
