import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/sequelize';
import { MailService } from '../../../shared/mail/mail.service';
import { User } from '../../user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize-typescript';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from '../dto/auth.dto';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
    let service: AuthService;
    let userModel: any;
    let jwtService: any;
    let mailService: any;
    let configService: any;
    let sequelize: any;

    const mockUser = {
        id: 1,
        firstName: 'Batool',
        lastName: 'Azzam',
        email: 'batool@gmail.com',
        username: 'batool2azzam',
        password: 'password123',
        isVerified: false,
    };

    const mockRegisterDto: RegisterDto = {
        firstName: 'Batool',
        lastName: 'Azzam',
        email: 'batool@gmail.com',
        username: 'batool2azzam',
        password: 'password123',
    };

    beforeEach(async () => {
        // Mock transaction
        const mockTransaction = {
            commit: jest.fn(),
            rollback: jest.fn(),
        };

        // Mock Sequelize
        sequelize = {
            transaction: jest.fn().mockResolvedValue(mockTransaction),
        };

        // Mock UserModel
        userModel = {
            create: jest.fn(),
            findOne: jest.fn(),
        };

        // Mock JwtService
        jwtService = {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
            verify: jest.fn(),
        };

        // Mock MailService
        mailService = {
            sendMail: jest.fn().mockResolvedValue(undefined),
        };

        // Mock ConfigService
        configService = {
            get: jest.fn().mockReturnValue('http://localhost:3000'),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: JwtService,
                    useValue: jwtService,
                },
                {
                    provide: MailService,
                    useValue: mailService,
                },
                {
                    provide: getModelToken(User),
                    useValue: userModel,
                },
                {
                    provide: ConfigService,
                    useValue: configService,
                },
                {
                    provide: Sequelize,
                    useValue: sequelize,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('register', () => {
        beforeEach(() => {
            mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);
        });

        it('should successfully register a new user', async () => {
            // Arrange
            userModel.findOne
                .mockResolvedValueOnce(null) // email check
                .mockResolvedValueOnce(null); // username check
            userModel.create.mockResolvedValue(mockUser);

            // Act
            const result = await service.register(mockRegisterDto);

            // Assert
            expect(result).toEqual({ message: 'Registration successful. Check your inbox.' });
            expect(userModel.findOne).toHaveBeenCalledTimes(2);
            expect(userModel.create).toHaveBeenCalledWith(
                {
                    firstName: mockRegisterDto.firstName,
                    lastName: mockRegisterDto.lastName,
                    email: mockRegisterDto.email,
                    username: mockRegisterDto.username,
                    password: 'hashedPassword',
                    isVerified: false,
                },
                { transaction: expect.any(Object) }
            );
            expect(mockedBcrypt.hash).toHaveBeenCalledWith(mockRegisterDto.password, 10);
            expect(jwtService.sign).toHaveBeenCalledWith(
                { sub: mockUser.id, email: mockUser.email },
                { expiresIn: '24h' }
            );
            expect(mailService.sendMail).toHaveBeenCalledWith(
                mockUser.email,
                'Verify your account',
                expect.stringContaining('Welcome, Batool!')
            );
            expect(sequelize.transaction).toHaveBeenCalled();
        });

        it('should throw ConflictException when email already exists', async () => {
            // Arrange
            userModel.findOne.mockResolvedValue(mockUser); // email exists

            // Act & Assert
            await expect(service.register(mockRegisterDto)).rejects.toThrow(
                new ConflictException('Email already exists')
            );
            expect(userModel.findOne).toHaveBeenCalledTimes(1);
            expect(userModel.create).not.toHaveBeenCalled();
        });

        it('should throw ConflictException when username already exists', async () => {
            // Arrange
            userModel.findOne
                .mockResolvedValueOnce(null) // email check
                .mockResolvedValueOnce(mockUser); // username exists

            // Act & Assert
            await expect(service.register(mockRegisterDto)).rejects.toThrow(
                new ConflictException('Username already exists')
            );
            expect(userModel.findOne).toHaveBeenCalledTimes(2);
            expect(userModel.create).not.toHaveBeenCalled();
        });

        it('should handle database errors and rollback transaction', async () => {
            // Arrange
            const dbError = new Error('Database error');
            userModel.findOne
                .mockResolvedValueOnce(null) // email check
                .mockResolvedValueOnce(null); // username check
            userModel.create.mockRejectedValue(dbError);

            // Act & Assert
            await expect(service.register(mockRegisterDto)).rejects.toThrow(dbError);
            expect(userModel.findOne).toHaveBeenCalledTimes(2);
            expect(userModel.create).toHaveBeenCalled();
        });

        it('should use correct frontend URL from config', async () => {
            // Arrange
            configService.get.mockReturnValue('https://myapp.com');
            userModel.findOne
                .mockResolvedValueOnce(null) // email check
                .mockResolvedValueOnce(null); // username check
            userModel.create.mockResolvedValue(mockUser);

            // Act
            await service.register(mockRegisterDto);

            // Assert
            expect(configService.get).toHaveBeenCalledWith('FRONTEND_URL');
            expect(mailService.sendMail).toHaveBeenCalledWith(
                mockUser.email,
                'Verify your account',
                expect.stringContaining('https://myapp.com/verify-email?token=')
            );
        });

        it('should fallback to localhost if FRONTEND_URL not configured', async () => {
            // Arrange
            configService.get.mockReturnValue(undefined);
            userModel.findOne
                .mockResolvedValueOnce(null) // email check
                .mockResolvedValueOnce(null); // username check
            userModel.create.mockResolvedValue(mockUser);

            // Act
            await service.register(mockRegisterDto);

            // Assert
            expect(mailService.sendMail).toHaveBeenCalledWith(
                mockUser.email,
                'Verify your account',
                expect.stringContaining('http://localhost:3000/verify-email?token=')
            );
        });
    });

    describe('validateUser', () => {
        beforeEach(() => {
            mockedBcrypt.compare.mockResolvedValue(true as never);
        });

        it('should return user data when credentials are valid and email is verified', async () => {
            // Arrange
            const verifiedUser = { ...mockUser, isVerified: true };
            userModel.findOne.mockResolvedValue(verifiedUser);

            // Act
            const result = await service.validateUser('test@example.com', 'password123');

            // Assert
            expect(result).toEqual({
                id: verifiedUser.id,
                firstName: verifiedUser.firstName,
                lastName: verifiedUser.lastName,
                email: verifiedUser.email,
                username: verifiedUser.username,
                isVerified: verifiedUser.isVerified,
            });
            expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', verifiedUser.password);
        });

        it('should throw UnauthorizedException when email is not verified', async () => {
            // Arrange
            const unverifiedUser = { ...mockUser, isVerified: false };
            userModel.findOne.mockResolvedValue(unverifiedUser);

            // Act & Assert
            await expect(service.validateUser('test@example.com', 'password123')).rejects.toThrow(
                new UnauthorizedException('Please verify your email before logging in.')
            );
        });

        it('should return null when user does not exist', async () => {
            // Arrange
            userModel.findOne.mockResolvedValue(null);

            // Act
            const result = await service.validateUser('nonexistent@example.com', 'password123');

            // Assert
            expect(result).toBeNull();
            expect(mockedBcrypt.compare).not.toHaveBeenCalled();
        });

        it('should return null when password is incorrect', async () => {
            // Arrange
            const verifiedUser = { ...mockUser, isVerified: true };
            userModel.findOne.mockResolvedValue(verifiedUser);
            mockedBcrypt.compare.mockResolvedValue(false as never);

            // Act
            const result = await service.validateUser('test@example.com', 'wrongpassword');

            // Assert
            expect(result).toBeNull();
            expect(mockedBcrypt.compare).toHaveBeenCalledWith('wrongpassword', verifiedUser.password);
        });
    });

    describe('resendVerificationEmail', () => {
        it('should send verification email for unverified user', async () => {
            // Arrange
            const unverifiedUser = { ...mockUser, isVerified: false };
            userModel.findOne.mockResolvedValue(unverifiedUser);

            // Act
            const result = await service.resendVerificationEmail('test@example.com');

            // Assert
            expect(result).toEqual({ message: 'Verification email sent successfully.' });
            expect(jwtService.sign).toHaveBeenCalledWith(
                { sub: unverifiedUser.id, email: unverifiedUser.email },
                { expiresIn: '24h' }
            );
            expect(mailService.sendMail).toHaveBeenCalledWith(
                unverifiedUser.email,
                'Verify your account',
                expect.stringContaining('Email Verification')
            );
        });

        it('should return message when user is already verified', async () => {
            // Arrange
            const verifiedUser = { ...mockUser, isVerified: true };
            userModel.findOne.mockResolvedValue(verifiedUser);

            // Act
            const result = await service.resendVerificationEmail('test@example.com');

            // Assert
            expect(result).toEqual({ message: 'Email is already verified.' });
            expect(mailService.sendMail).not.toHaveBeenCalled();
        });

        it('should return generic message when user does not exist', async () => {
            // Arrange
            userModel.findOne.mockResolvedValue(null);

            // Act
            const result = await service.resendVerificationEmail('nonexistent@example.com');

            // Assert
            expect(result).toEqual({ message: 'If an account with that email exists, a verification link has been sent.' });
            expect(mailService.sendMail).not.toHaveBeenCalled();
        });
    });
});
