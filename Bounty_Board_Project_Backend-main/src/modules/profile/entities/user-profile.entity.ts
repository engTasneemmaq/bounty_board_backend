import {
    Table, Column, Model, DataType, ForeignKey, BelongsTo, Unique
} from 'sequelize-typescript';
import { User } from '../../user/entities/user.entity';

@Table({ tableName: 'user_profiles' })
export class UserProfile extends Model<UserProfile> {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    declare id: number;

    @ForeignKey(() => User)
    @Unique
    @Column({ type: DataType.INTEGER, allowNull: false })
    declare userId: number;

    @BelongsTo(() => User)
    declare user: User;

    // Step 1 – Personal
    @Column({ type: DataType.STRING })
    declare firstName?: string;

    @Column({ type: DataType.STRING })
    declare lastName?: string;

    @Column({ type: DataType.STRING })
    declare jobTitle?: string;

    @Column({ type: DataType.INTEGER })
    declare experienceYears?: number;

    @Column({ type: DataType.STRING })
    declare education?: string;

    @Column({ type: DataType.ARRAY(DataType.STRING) })
    declare skills?: string[];

    @Column({ type: DataType.STRING })
    declare currentPosition?: string;

    @Column({ type: DataType.STRING })
    declare personalWebsite?: string;

    @Column({ type: DataType.STRING })
    declare avatarUrl?: string;

    @Column({ type: DataType.STRING })
    declare cvUrl?: string;

    // Step 2 – Profile
    @Column({ type: DataType.STRING })
    declare nationality?: string;

    @Column({ type: DataType.DATEONLY })
    declare dateOfBirth?: Date;

    @Column({ type: DataType.ENUM('male', 'female', 'other') })
    declare gender?: 'male' | 'female' | 'other';

    @Column({ type: DataType.ENUM('single', 'married', 'divorced', 'widowed', 'other') })
    declare maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed' | 'other';

    @Column({ type: DataType.ARRAY(DataType.STRING) })
    declare languages?: string[];

    @Column({ type: DataType.STRING })
    declare country?: string;

    @Column({ type: DataType.TEXT })
    declare bio?: string;

    @Column({ type: DataType.STRING })
    declare linkedInUrl?: string;

    // Step 3 – Contact
    @Column({ type: DataType.STRING })
    declare phoneNumber?: string;

    @Column({ type: DataType.STRING })
    declare primaryEmail?: string;

    @Column({ type: DataType.STRING })
    declare secondaryEmail?: string;
} 