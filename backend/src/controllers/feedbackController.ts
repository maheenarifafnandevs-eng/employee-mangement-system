import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../config/database';
import logger from '../middlewares/logger';

/**
 * Get all feedback
 */
export const getAllFeedback = async (req: AuthRequest, res: Response) => {
    try {
        const feedback = await prisma.feedback.findMany({
            include: {
                from: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
                to: {
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
            data: feedback,
        });
    } catch (_error: any) {
        logger.error('Get feedback error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch feedback',
        });
    }
};

/**
 * Give feedback
 */
export const giveFeedback = async (req: AuthRequest, res: Response) => {
    try {
        const { toEmployeeId, type, rating, comment, anonymous } = req.body;
        const userId = req.user?.userId;

        const fromEmployee = await prisma.employee.findUnique({
            where: { userId },
        });

        if (!fromEmployee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
        }

        const feedback = await prisma.feedback.create({
            data: {
                fromId: fromEmployee.id,
                toId: toEmployeeId,
                type,
                rating,
                comment,
                isAnonymous: anonymous || false,
            },
        });

        logger.info(`Feedback given: ${feedback.id}`);

        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: feedback,
        });
    } catch (_error: any) {
        logger.error('Give feedback error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit feedback',
        });
    }
};

/**
 * Get received feedback
 */
export const getReceivedFeedback = async (req: AuthRequest, res: Response) => {
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

        const feedback = await prisma.feedback.findMany({
            where: {
                toId: employee.id,
            },
            include: {
                from: {
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

        // Hide sender info for anonymous feedback
        const processedFeedback = feedback.map((f) => ({
            ...f,
            from: f.isAnonymous ? null : f.from,
        }));

        res.json({
            success: true,
            data: processedFeedback,
        });
    } catch (_error: any) {
        logger.error('Get received feedback error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch received feedback',
        });
    }
};

/**
 * Get given feedback
 */
export const getGivenFeedback = async (req: AuthRequest, res: Response) => {
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

        const feedback = await prisma.feedback.findMany({
            where: {
                fromId: employee.id,
            },
            include: {
                to: {
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
            data: feedback,
        });
    } catch (_error: any) {
        logger.error('Get given feedback error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch given feedback',
        });
    }
};
