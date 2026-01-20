import { Router } from 'express';
import {
    getAllGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    getPerformanceMetrics,
} from '../controllers/performanceController';
import { authenticate } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/performance/goals
 * @desc    Get all goals
 * @access  Private
 */
router.get('/goals', asyncHandler(getAllGoals));

/**
 * @route   POST /api/performance/goals
 * @desc    Create goal
 * @access  Private
 */
router.post('/goals', asyncHandler(createGoal));

/**
 * @route   PUT /api/performance/goals/:id
 * @desc    Update goal
 * @access  Private
 */
router.put('/goals/:id', asyncHandler(updateGoal));

/**
 * @route   DELETE /api/performance/goals/:id
 * @desc    Delete goal
 * @access  Private
 */
router.delete('/goals/:id', asyncHandler(deleteGoal));

/**
 * @route   GET /api/performance/metrics
 * @desc    Get performance metrics
 * @access  Private
 */
router.get('/metrics', asyncHandler(getPerformanceMetrics));

export default router;
