import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { clerkMiddleware } from '@clerk/express';

import connectDB from './config/db.js';
import resumeRoutes from './routes/resumeRoutes.js';
import jobRoutes from './routes/jobRoutes.js';

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// This checks cookies/headers and populates 'req.auth'
app.use(clerkMiddleware());

// Routes
app.use('/api/resumes', resumeRoutes);
app.use('/api/jobs', jobRoutes);

app.get('/', (req, res) => {
  res.send('TalentScout AI Backend is Active');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`⚡ Server running on port ${PORT}`));