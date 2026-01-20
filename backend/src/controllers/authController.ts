import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import logger from '../middlewares/logger';

/**
 * Register new user
 */
export const register = async (req: AuthRequest, res: Response) => {
    try {
        const { email, password, name, role = 'EMPLOYEE' } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists',
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        logger.info(`New user registered: ${email}`);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: user,
        });
    } catch (_error: any) {
        logger.error('Registration error:', _error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
        });
    }
};

/**
 * Login user
 */
export const login = async (req: AuthRequest, res: Response) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                employee: {
                    select: {
                        id: true,
                        employeeId: true,
                        firstName: true,
                        lastName: true,
                        position: true,
                        department: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Verify password
        const isValidPassword = await comparePassword(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        const refreshToken = generateRefreshToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        logger.info(`User logged in: ${email}`);

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userWithoutPassword,
                accessToken,
                refreshToken,
            },
        });
    } catch (_error: any) {
        logger.error('Login error:', _error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
        });
    }
};

/**
 * Get current user profile
 */
export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: {
                employee: {
                    include: {
                        department: true,
                        manager: {
                            select: {
                                firstName: true,
                                lastName: true,
                                position: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        res.json({
            success: true,
            data: userWithoutPassword,
        });
    } catch (_error: any) {
        logger.error('Get profile error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile',
        });
    }
};

/**
 * Logout user
 */
export const logout = async (req: AuthRequest, res: Response) => {
    try {
        // In a real app, you might want to blacklist the token
        logger.info(`User logged out: ${req.user?.email}`);

        res.json({
            success: true,
            message: 'Logout successful',
        });
    } catch (_error: any) {
        logger.error('Logout error:', _error);
        res.status(500).json({
            success: false,
            message: 'Logout failed',
        });
    }
};
