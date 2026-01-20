import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../config/database';
import logger from '../middlewares/logger';

/**
 * Get all goals
 */
export const getAllGoals = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { employeeId } = req.query;

        const employee = await prisma.employee.findUnique({
            where: { userId },
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
        }

        const where: any = {};
        if (employeeId) {
            where.employeeId = employeeId;
        } else {
            where.employeeId = employee.id;
        }

        const goals = await prisma.goal.findMany({
            where,
            include: {
                employee: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json({
            success: true,
            data: goals,
        });
    } catch (_error: any) {
        logger.error('Get goals error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch goals',
        });
    }
};

/**
 * Create goal
 */
export const createGoal = async (req: AuthRequest, res: Response) => {
    try {
        const {
            title,
            description,
            category,
            type,
            targetValue,
            currentValue,
            progress,
            status,
            priority,
            dueDate
        } = req.body;
        const userId = req.user?.userId;

        const employee = await prisma.employee.findUnique({
            where: { userId },
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
        }

        const goal = await prisma.goal.create({
            data: {
                employeeId: employee.id,
                title,
                description,
                category: category || 'INDIVIDUAL',
                type: type || 'QUALITATIVE',
                targetValue,
                currentValue,
                progress: progress || 0,
                status: status || 'NOT_STARTED',
                priority: priority || 'MEDIUM',
                dueDate: new Date(dueDate),
            },
        });

        logger.info(`Goal created: ${goal.id}`);

        res.status(201).json({
            success: true,
            message: 'Goal created successfully',
            data: goal,
        });
    } catch (_error: any) {
        logger.error('Create goal error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to create goal',
        });
    }
};

/**
 * Get single goal
 */
export const getGoal = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const goal = await prisma.goal.findUnique({
            where: { id },
        });

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'Goal not found',
            });
        }

        res.json({
            success: true,
            data: goal,
        });
    } catch (_error: any) {
        logger.error('Get goal error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch goal',
        });
    }
};

/**
 * Update goal
 */
export const updateGoal = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (updateData.dueDate) {
            updateData.dueDate = new Date(updateData.dueDate);
        }

        const goal = await prisma.goal.update({
            where: { id },
            data: updateData,
        });

        logger.info(`Goal updated: ${goal.id}`);

        res.json({
            success: true,
            message: 'Goal updated successfully',
            data: goal,
        });
    } catch (_error: any) {
        logger.error('Update goal error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to update goal',
        });
    }
};

/**
 * Delete goal
 */
export const deleteGoal = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.goal.delete({
            where: { id },
        });

        logger.info(`Goal deleted: ${id}`);

        res.json({
            success: true,
            message: 'Goal deleted successfully',
        });
    } catch (_error: any) {
        logger.error('Delete goal error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete goal',
        });
    }
};

/**
 * Get performance metrics
 */
export const getPerformanceMetrics = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        const employee = await prisma.employee.findUnique({
            where: { userId },
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
        }

        const goals = await prisma.goal.findMany({
            where: { employeeId: employee.id },
        });

        const totalGoals = goals.length;
        const completedGoals = goals.filter((g) => g.status === 'COMPLETED').length;
        const inProgressGoals = goals.filter((g) => g.status === 'IN_PROGRESS').length;
        const averageProgress = totalGoals > 0
            ? goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals
            : 0;

        const reviews = await prisma.review.findMany({
            where: { employeeId: employee.id },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });

        const averageRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length
            : 0;

        res.json({
            success: true,
            data: {
                goals: {
                    total: totalGoals,
                    completed: completedGoals,
                    inProgress: inProgressGoals,
                    averageProgress: Math.round(averageProgress),
                },
                reviews: {
                    total: reviews.length,
                    averageRating: Math.round(averageRating * 10) / 10,
                    recent: reviews,
                },
            },
        });
    } catch (_error: any) {
        logger.error('Get performance metrics error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch performance metrics',
        });
    }
};
