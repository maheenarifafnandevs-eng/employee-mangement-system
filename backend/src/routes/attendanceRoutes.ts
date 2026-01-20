import { Router } from 'express';
import {
    clockIn,
    clockOut,
    getMonthlySummary,
} from '../controllers/attendanceController';
import { authenticate } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/attendance/clock-in
 * @desc    Clock in
 * @access  Private
 */
router.post('/clock-in', asyncHandler(clockIn));

/**
 * @route   POST /api/attendance/clock-out
 * @desc    Clock out
 * @access  Private
 */
router.post('/clock-out', asyncHandler(clockOut));

/**
 * @route   GET /api/attendance/summary/:month
 * @desc    Get monthly attendance summary
 * @access  Private
 */
router.get('/summary/:month', asyncHandler(getMonthlySummary));

export default router;
