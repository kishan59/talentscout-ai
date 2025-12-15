import express from 'express';
// 1. Import the strict 'requireAuth' middleware
import { requireAuth } from '@clerk/express'; 
import { createJob, getJobs, getJobById, getJobCandidates, updateJobStatus } from '../controllers/jobController.js';

const router = express.Router();

// 2. Protect these routes
// If no token is sent, Clerk throws a 401 Unauthorized automatically.
router.post('/', requireAuth(), createJob);
router.get('/', requireAuth(), getJobs);
router.get('/:id', requireAuth(), getJobById);
router.get('/:id/candidates', requireAuth(), getJobCandidates);
router.patch('/:id/status', requireAuth(), updateJobStatus);

export default router;