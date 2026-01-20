import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../config/database';
import logger from '../middlewares/logger';

/**
 * Clock in
 */
export const clockIn = async (req: AuthRequest, res: Response) => {
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

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already clocked in today
        const existing = await prisma.attendance.findFirst({
            where: {
                employeeId: employee.id,
                date: {
                    gte: today,
                },
            },
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Already clocked in today',
            });
        }

        const attendance = await prisma.attendance.create({
            data: {
                employeeId: employee.id,
                date: new Date(),
                clockIn: new Date(),
                status: 'PRESENT',
            },
        });

        logger.info(`Clock in: ${employee.email}`);

        res.json({
            success: true,
            message: 'Clocked in successfully',
            data: attendance,
        });
    } catch (_error: any) {
        logger.error('Clock in error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to clock in',
        });
    }
};

/**
 * Clock out
 */
export const clockOut = async (req: AuthRequest, res: Response) => {
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

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await prisma.attendance.findFirst({
            where: {
                employeeId: employee.id,
                date: {
                    gte: today,
                },
            },
        });

        if (!attendance) {
            return res.status(400).json({
                success: false,
                message: 'No clock in record found for today',
            });
        }

        if (attendance.clockOut) {
            return res.status(400).json({
                success: false,
                message: 'Already clocked out',
            });
        }

        const updated = await prisma.attendance.update({
            where: { id: attendance.id },
            data: {
                clockOut: new Date(),
            },
        });

        logger.info(`Clock out: ${employee.email}`);

        res.json({
            success: true,
            message: 'Clocked out successfully',
            data: updated,
        });
    } catch (_error: any) {
        logger.error('Clock out error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to clock out',
        });
    }
};

/**
 * Get monthly summary
 */
export const getMonthlySummary = async (req: AuthRequest, res: Response) => {
    try {
        const { month } = req.params; // Format: YYYY-MM
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

        const [year, monthNum] = month.split('-').map(Number);
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0);

        const attendance = await prisma.attendance.findMany({
            where: {
                employeeId: employee.id,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: {
                date: 'asc',
            },
        });

        const totalDays = attendance.length;
        const presentDays = attendance.filter((a) => a.status === 'PRESENT').length;
        const absentDays = attendance.filter((a) => a.status === 'ABSENT').length;
        const lateDays = attendance.filter((a) => a.status === 'LATE').length;

        res.json({
            success: true,
            data: {
                month,
                attendance,
                summary: {
                    totalDays,
                    presentDays,
                    absentDays,
                    lateDays,
                    attendanceRate: totalDays > 0 ? (presentDays / totalDays) * 100 : 0,
                },
            },
        });
    } catch (_error: any) {
        logger.error('Get monthly summary error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch monthly summary',
        });
    }
};
