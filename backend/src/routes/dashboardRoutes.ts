import { Router } from 'express';
import {
    getDashboardStats,
    getAttendanceTrend,
    getDepartmentDistribution,
    getRecentActivity,
} from '../controllers/dashboardController';
import { authenticate } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private
 */
router.get('/stats', asyncHandler(getDashboardStats));

/**
 * @route   GET /api/dashboard/attendance-trend
 * @desc    Get attendance trend (last 7 days)
 * @access  Private
 */
router.get('/attendance-trend', asyncHandler(getAttendanceTrend));

/**
 * @route   GET /api/dashboard/department-distribution
 * @desc    Get department distribution
 * @access  Private
 */
router.get('/department-distribution', asyncHandler(getDepartmentDistribution));

/**
 * @route   GET /api/dashboard/recent-activity
 * @desc    Get recent activity
 * @access  Private
 */
router.get('/recent-activity', asyncHandler(getRecentActivity));

export default router;
