import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../entities/user.entity';
import { CreationAttributes } from 'sequelize';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User)
        private userModel: typeof User,
    ) { }

    async findAll(): Promise<User[]> {
        return this.userModel.findAll();
    }

    async findOne(id: number): Promise<User> {
        const user = await this.userModel.findByPk(id);
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ where: { email } });
    }

    async create(userData: CreationAttributes<User>): Promise<User> {
        return this.userModel.create(userData);
    }

    async update(id: number, userData: Partial<User>): Promise<[number, User[]]> {
        const [affectedCount, affectedRows] = await this.userModel.update(userData, {
            where: { id },
            returning: true,
        });

        if (affectedCount === 0) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return [affectedCount, affectedRows];
    }

    async remove(id: number): Promise<number> {
        const deletedCount = await this.userModel.destroy({
            where: { id },
        });

        if (deletedCount === 0) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return deletedCount;
    }
} 