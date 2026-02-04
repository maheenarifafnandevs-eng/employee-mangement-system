import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../config/database';
import logger from '../middlewares/logger';

/**
 * Get all employees
 */
export const getAllEmployees = async (req: AuthRequest, res: Response) => {
    try {
        const employees = await prisma.employee.findMany({
            include: {
                user: {
                    select: {
                        email: true,
                        role: true,
                    },
                },
                department: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                shift: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json({
            success: true,
            data: employees,
            total: employees.length,
        });
    } catch (_error: any) {
        logger.error('Get all employees error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch employees',
        });
    }
};

/**
 * Get single employee
 */
export const getEmployee = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const employee = await prisma.employee.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        email: true,
                        role: true,
                    },
                },
                department: true,
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                subordinates: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        position: true,
                    },
                },
                attendance: {
                    take: 10,
                    orderBy: {
                        date: 'desc',
                    },
                },
                leaveRequests: {
                    take: 5,
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                goals: {
                    take: 5,
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                shift: true,
            },
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
        }

        res.json({
            success: true,
            data: employee,
        });
    } catch (_error: any) {
        logger.error('Get employee error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch employee',
        });
    }
};

/**
 * Create employee
 */
export const createEmployee = async (req: AuthRequest, res: Response) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            dateOfBirth,
            gender,
            address,
            city,
            country,
            postalCode,
            position,
            departmentId,
            managerId,
            salary,
            hireDate,
            employmentType,
            cnic,
            highestQualification,
            institute,
        } = req.body;

        // Generate employee ID
        const employeeCount = await prisma.employee.count();
        const employeeId = `EMP${String(employeeCount + 1).padStart(4, '0')}`;

        // Create user first
        const user = await prisma.user.create({
            data: {
                email,
                password: '$2b$12$defaultHashedPassword', // Should be changed on first login
                name: `${firstName} ${lastName}`,
                role: 'EMPLOYEE',
            },
        });

        // Create employee
        const employee = await prisma.employee.create({
            data: {
                userId: user.id,
                employeeId,
                firstName,
                lastName,
                email,
                phone,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                gender,
                address,
                city,
                country,
                postalCode,
                position,
                departmentId,
                managerId: managerId || null, // Convert empty string to null
                salary,
                hireDate: new Date(hireDate),
                employmentType,
                status: 'ACTIVE',
                cnic: cnic || null,
                highestQualification: highestQualification || null,
                institute: institute || null,
            },
            include: {
                user: {
                    select: {
                        email: true,
                        role: true,
                    },
                },
                department: true,
                shift: true,
            },
        });

        logger.info(`Employee created: ${employee.email}`);

        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: employee,
        });
    } catch (_error: any) {
        logger.error('Create employee error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to create employee',
        });
    }
};

/**
 * Update employee
 */
export const updateEmployee = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Remove fields that shouldn't be updated directly
        delete updateData.userId;
        delete updateData.employeeId;
        delete updateData.createdAt;

        // Convert date strings to Date objects
        if (updateData.dateOfBirth) {
            updateData.dateOfBirth = new Date(updateData.dateOfBirth);
        }
        if (updateData.hireDate) {
            updateData.hireDate = new Date(updateData.hireDate);
        }

        // Convert empty managerId to null
        if (updateData.managerId === '' || updateData.managerId === undefined) {
            updateData.managerId = null;
        }

        const employee = await prisma.employee.update({
            where: { id },
            data: updateData,
            include: {
                user: {
                    select: {
                        email: true,
                        role: true,
                    },
                },
                department: true,
                shift: true,
            },
        });

        logger.info(`Employee updated: ${employee.email}`);

        res.json({
            success: true,
            message: 'Employee updated successfully',
            data: employee,
        });
    } catch (_error: any) {
        logger.error('Update employee error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to update employee',
        });
    }
};

/**
 * Delete employee
 */
export const deleteEmployee = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        // Get employee to find user ID
        const employee = await prisma.employee.findUnique({
            where: { id },
            select: { userId: true, email: true },
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
        }

        // Delete employee (will cascade delete user due to onDelete: Cascade)
        await prisma.employee.delete({
            where: { id },
        });

        logger.info(`Employee deleted: ${employee.email}`);

        res.json({
            success: true,
            message: 'Employee deleted successfully',
        });
    } catch (_error: any) {
        logger.error('Delete employee error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete employee',
        });
    }
};

/**
 * Get dashboard stats
 */
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        const totalEmployees = await prisma.employee.count({
            where: { status: 'ACTIVE' },
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const presentToday = await prisma.attendance.count({
            where: {
                date: {
                    gte: today,
                },
                status: 'PRESENT',
            },
        });

        const onLeave = await prisma.leaveRequest.count({
            where: {
                status: 'APPROVED',
                startDate: {
                    lte: new Date(),
                },
                endDate: {
                    gte: new Date(),
                },
            },
        });

        const pendingRequests = await prisma.leaveRequest.count({
            where: {
                status: 'PENDING',
            },
        });

        res.json({
            success: true,
            data: {
                totalEmployees,
                presentToday,
                onLeave,
                pendingRequests,
            },
        });
    } catch (_error: any) {
        logger.error('Get dashboard stats error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard stats',
        });
    }
};

/**
 * Upload employee document
 */
export const uploadDocument = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { documentType } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        // Verify employee exists
        const employee = await prisma.employee.findUnique({
            where: { id },
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
        }

        // Create document record
        const document = await prisma.employeeDocument.create({
            data: {
                employeeId: id,
                documentType: documentType || 'OTHER',
                fileName: req.file.originalname,
                filePath: req.file.path,
                fileSize: req.file.size,
                mimeType: req.file.mimetype,
                uploadedBy: req.user?.userId,
            },
        });

        logger.info(`Document uploaded for employee: ${id}`);

        res.status(201).json({
            success: true,
            message: 'Document uploaded successfully',
            data: document,
        });
    } catch (_error: any) {
        logger.error('Upload document error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload document',
        });
    }
};

/**
 * Get employee documents
 */
export const getEmployeeDocuments = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const documents = await prisma.employeeDocument.findMany({
            where: {
                employeeId: id,
            },
            orderBy: {
                uploadedAt: 'desc',
            },
        });

        res.json({
            success: true,
            data: documents,
        });
    } catch (_error: any) {
        logger.error('Get documents error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch documents',
        });
    }
};

/**
 * Delete employee document
 */
export const deleteDocument = async (req: AuthRequest, res: Response) => {
    try {
        const { documentId } = req.params;

        const document = await prisma.employeeDocument.findUnique({
            where: { id: documentId },
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found',
            });
        }

        // Delete file from filesystem
        const fs = require('fs');
        if (fs.existsSync(document.filePath)) {
            fs.unlinkSync(document.filePath);
        }

        // Delete database record
        await prisma.employeeDocument.delete({
            where: { id: documentId },
        });

        logger.info(`Document deleted: ${documentId}`);

        res.json({
            success: true,
            message: 'Document deleted successfully',
        });
    } catch (_error: any) {
        logger.error('Delete document error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete document',
        });
    }
};

/**
 * Download employee document
 */
export const downloadDocument = async (req: AuthRequest, res: Response) => {
    try {
        const { documentId } = req.params;

        const document = await prisma.employeeDocument.findUnique({
            where: { id: documentId },
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found',
            });
        }

        const fs = require('fs');
        if (!fs.existsSync(document.filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found on server',
            });
        }

        res.download(document.filePath, document.fileName);
    } catch (_error: any) {
        logger.error('Download document error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to download document',
        });
    }
};

