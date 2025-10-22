import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { Bounty } from './bounty.entity';

export enum BountyResourceType {
    Link = 'link',
    PDF = 'pdf',
}

@Table({ tableName: 'bounty_resources' })
export class BountyResource extends Model<BountyResource> {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    declare id: number;

    @ForeignKey(() => Bounty)
    @Column({ type: DataType.INTEGER, allowNull: false })
    declare bountyId: number;

    @BelongsTo(() => Bounty)
    declare bounty: Bounty;

    @Column({ type: DataType.ENUM('link', 'pdf'), allowNull: false })
    declare type: BountyResourceType;

    @Column({ type: DataType.STRING, allowNull: false })
    declare url: string;

    @Column({ type: DataType.STRING, allowNull: false })
    declare name: string;

    @CreatedAt
    @Column({ type: DataType.DATE })
    declare createdAt: Date;

    @UpdatedAt
    @Column({ type: DataType.DATE })
    declare updatedAt: Date;
} 