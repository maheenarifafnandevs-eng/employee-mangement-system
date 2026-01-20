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

        // Check assigned shift for punctuality
        let status: 'PRESENT' | 'LATE' = 'PRESENT';
        if (employee.shiftId) {
            const shift = await prisma.shift.findUnique({ where: { id: employee.shiftId } });
            if (shift) {
                const now = new Date();
                const [shiftHour, shiftMin] = shift.startTime.split(':').map(Number);
                const shiftTime = new Date();
                shiftTime.setHours(shiftHour, shiftMin, 0, 0);

                // Add 15 minutes grace period
                if (now.getTime() > shiftTime.getTime() + 15 * 60 * 1000) {
                    status = 'LATE';
                }
            }
        }

        const attendance = await prisma.attendance.create({
            data: {
                employeeId: employee.id,
                date: new Date(),
                clockIn: new Date(),
                status,
            },
        });

        logger.info(`Clock in: ${employee.email} - Status: ${status}`);

        res.json({
            success: true,
            message: status === 'LATE' ? 'Clocked in successfully (Late)' : 'Clocked in successfully',
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

/**
 * Get detailed attendance report
 */
export const getAttendanceReport = async (req: AuthRequest, res: Response) => {
    try {
        const { startDate, endDate, departmentId, employeeId } = req.query;

        const where: any = {};

        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate as string);
            if (endDate) where.date.lte = new Date(endDate as string);
        }

        if (employeeId) {
            where.employeeId = employeeId;
        } else if (departmentId) {
            where.employee = {
                departmentId: departmentId as string
            };
        }

        const attendance = await prisma.attendance.findMany({
            where,
            include: {
                employee: {
                    select: {
                        firstName: true,
                        lastName: true,
                        employeeId: true,
                        department: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });

        res.json({
            success: true,
            data: attendance
        });
    } catch (_error: any) {
        logger.error('Get attendance report error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch attendance report',
        });
    }
};
