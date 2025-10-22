import {
  Table, Column, Model, DataType,
  ForeignKey, BelongsTo, CreatedAt, UpdatedAt
} from 'sequelize-typescript';
import { Bounty } from '../../bounty/entities/bounty.entity';
import { User } from '../../user/entities/user.entity';

export enum ApplicationStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Rejected = 'rejected',
}

@Table({ tableName: 'applications' })
export class Application extends Model<Application> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare id: number;

  /* -------- relations -------- */
  @ForeignKey(() => Bounty)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare bountyId: number;

  @BelongsTo(() => Bounty)
  bounty: Bounty;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare hunterId: number;

  @BelongsTo(() => User)
  hunter: User;

  /* -------- status -------- */
  @Column({
    type: DataType.ENUM(...Object.values(ApplicationStatus)),
    defaultValue: ApplicationStatus.Pending,
  })
  declare status: ApplicationStatus;

  /* -------- timestamps -------- */
  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
