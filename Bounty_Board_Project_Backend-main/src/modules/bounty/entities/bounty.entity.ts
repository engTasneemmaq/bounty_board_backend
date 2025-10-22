import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { User } from '../../user/entities/user.entity';
import { BountyRole } from './bounty-role.entity';
import { BountyResource } from './bounty-resource.entity';
import { Application } from '../../application/entities/application.entity';

export enum BountyStatus {
    Draft = 'draft',
    Active = 'active',
    Completed = 'completed',
}

@Table({ tableName: 'bounties' })
export class Bounty extends Model {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    declare id: number;

    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER, allowNull: false })
    declare posterId: number;

    @BelongsTo(() => User)
    declare poster: User;

    @Column({ type: DataType.STRING(255), allowNull: false })
    declare title: string;

    @Column({ type: DataType.TEXT, allowNull: false })
    declare description: string;

    @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
    declare reward: number;

    @Column({ type: DataType.DATE, allowNull: false })
    declare deadline: Date;

    @Column({ type: DataType.STRING(500) })
    declare thumbnailUrl?: string;

    @Column({ type: DataType.STRING(100) })
    declare category?: string;

    @Column({ type: DataType.STRING(10) })
    declare currency?: string;

    @Column({ type: DataType.ARRAY(DataType.STRING) })
    declare languages?: string[];

    @Column({ type: DataType.TEXT })
    declare requirements?: string;

    @Column({ type: DataType.TEXT })
    declare technicalDetails?: string;

    @Column({ type: DataType.STRING(255) })
    declare contactEmail?: string;

    @Column({ type: DataType.STRING(500) })
    declare website?: string;

    @Column({ type: DataType.ARRAY(DataType.STRING) })
    declare skills?: string[];

    @Column({
        type: DataType.ENUM(...Object.values(BountyStatus)),
        allowNull: false,
        defaultValue: BountyStatus.Draft
    })
    declare status: BountyStatus;

    @HasMany(() => BountyRole)
    declare roles: BountyRole[];

    @HasMany(() => BountyResource)
    declare resources: BountyResource[];

    @HasMany(() => Application)
    declare applications: Application[];

    @CreatedAt
    declare createdAt: Date;

    @UpdatedAt
    declare updatedAt: Date;
}