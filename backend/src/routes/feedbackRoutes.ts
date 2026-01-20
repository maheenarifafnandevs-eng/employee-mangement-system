import { Router } from 'express';
import {
    getAllFeedback,
    giveFeedback,
    getReceivedFeedback,
    getGivenFeedback,
} from '../controllers/feedbackController';
import { authenticate } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/feedback
 * @desc    Get all feedback
 * @access  Private
 */
router.get('/', asyncHandler(getAllFeedback));

/**
 * @route   POST /api/feedback
 * @desc    Give feedback
 * @access  Private
 */
router.post('/', asyncHandler(giveFeedback));

/**
 * @route   GET /api/feedback/received
 * @desc    Get received feedback
 * @access  Private
 */
router.get('/received', asyncHandler(getReceivedFeedback));

/**
 * @route   GET /api/feedback/given
 * @desc    Get given feedback
 * @access  Private
 */
router.get('/given', asyncHandler(getGivenFeedback));

export default router;
