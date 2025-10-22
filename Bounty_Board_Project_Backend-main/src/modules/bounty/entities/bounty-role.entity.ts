import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { Bounty } from './bounty.entity';

@Table({ tableName: 'bounty_roles' })
export class BountyRole extends Model<BountyRole> {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    declare id: number;

    @ForeignKey(() => Bounty)
    @Column({ type: DataType.INTEGER, allowNull: false })
    declare bountyId: number;

    @BelongsTo(() => Bounty)
    declare bounty: Bounty;

    @Column({ type: DataType.STRING, allowNull: false })
    declare roleName: string;

    @Column({ type: DataType.ARRAY(DataType.STRING), allowNull: false })
    declare technologies: string[];

    @CreatedAt
    @Column({ type: DataType.DATE })
    declare createdAt: Date;

    @UpdatedAt
    @Column({ type: DataType.DATE })
    declare updatedAt: Date;
} 