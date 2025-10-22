//src\modules\user\entities\user.entity.ts
import {
    Column, Model, Table, DataType,
    BelongsToMany, HasOne
} from 'sequelize-typescript';
import { Role } from '../../role/entities/role.entity';
import { UserProfile } from '../../profile/entities/user-profile.entity';

@Table
export class User extends Model<User> {

    /* ---------- columns ---------- */
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    declare id: number;

    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    declare username: string;

    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    declare email: string;

    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    declare isVerified: boolean;

    @Column({ type: DataType.STRING, allowNull: false })
    declare password: string;

    @Column({ type: DataType.STRING, allowNull: true })
    declare firstName?: string;

    @Column({ type: DataType.STRING, allowNull: true })
    declare lastName?: string;

    /* ---------- relations ---------- */
    @BelongsToMany(() => Role, 'UserRoles', 'userId', 'roleId')
    declare roles: Role[];

    @HasOne(() => UserProfile)
    declare profile: UserProfile;
}
