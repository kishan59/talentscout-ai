import express from 'express';
import multer from 'multer'; // Import multer
import { requireAuth } from '@clerk/express';
import { analyzeResume, generateEmail, updateStatus, deleteCandidate } from '../controllers/resumeController.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes
router.post('/analyze', requireAuth(), upload.single('resume'), analyzeResume);
router.post('/generate-email', requireAuth(), generateEmail);
router.patch('/status', requireAuth(), updateStatus);
router.delete('/:id', requireAuth(), deleteCandidate);

export default router;