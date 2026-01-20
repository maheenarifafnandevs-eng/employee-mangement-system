import { Router } from 'express';
import authRoutes from './authRoutes';
import passwordRoutes from './passwordRoutes';
import employeeRoutes from './employeeRoutes';
import dashboardRoutes from './dashboardRoutes';
import leaveRoutes from './leaveRoutes';
import attendanceRoutes from './attendanceRoutes';
import performanceRoutes from './performanceRoutes';
import reviewRoutes from './reviewRoutes';
import feedbackRoutes from './feedbackRoutes';
import departmentRoutes from './departmentRoutes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/password', passwordRoutes);
router.use('/employees', employeeRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/leaves', leaveRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/performance', performanceRoutes);
router.use('/reviews', reviewRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/departments', departmentRoutes);

// Health check for API
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString(),
    });
});

export default router;
