import Job from '../models/Job.js';
import Candidate from '../models/Candidate.js';

export const createJob = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ error: "Title and Description are required" });
    }

    const { userId } = req.auth; 

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const newJob = new Job({ 
      title, 
      description,
      userId // Stamp the owner
    });
    
    await newJob.save();
    res.status(201).json(newJob);
  } catch (error) {
    console.error("Create Job Error:", error);
    res.status(500).json({ error: "Failed to create job" });
  }
};

export const getJobs = async (req, res) => {
  try {
    const { userId } = req.auth;
    const jobs = await Job.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

export const getJobById = async (req, res) => {
  try {
    const { userId } = req.auth;
    const jobId = req.params.id;
    const job = await Job.findOne({ _id: jobId, userId });
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch job" });
  }
};

export const getJobCandidates = async (req, res) => {
  try {
    const { userId } = req.auth;
    const jobId = req.params.id;

    // Security: Ensure the job belongs to this user first
    const job = await Job.findOne({ _id: jobId, userId });
    if (!job) return res.status(404).json({ error: "Job not found or unauthorized" });

    // Fetch candidates sorted by Score (High to Low)
    const candidates = await Candidate.find({ jobId }).sort({ aiScore: -1 });
    
    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch candidates" });
  }
};

export const updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active' or 'archived'
    const { userId } = req.auth;

    const job = await Job.findOne({ _id: id, userId });
    if (!job) return res.status(404).json({ error: "Job not found" });

    job.status = status;
    await job.save();

    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ error: "Failed to update status" });
  }
};