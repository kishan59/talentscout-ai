import mongoose from 'mongoose';

const CandidateSchema = new mongoose.Schema({
  // Link to Job
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },

  name: { type: String, required: true, default: "Unknown" },
  email: { type: String, required: true, default: "no-email@found.com" },
  
  aiScore: { type: Number, required: true },
  tier: { type: String, enum: ['S', 'A', 'B', 'F'], required: true },
  summary: { type: String, required: true },

  // Instead of hardcoded "frontend", we allow ANY string key
  // Example for Sales: { "Negotiation": 90, "Cold Calling": 60 }
  // Example for Dev: { "React": 80, "System Design": 70 }
  keySkills: {
    type: Map,
    of: Number
  },
  badges: [String],
  status: {
    type: String,
    enum: ['New', 'Selected', 'Invited', 'Rejected'],
    default: 'New'
  },
  emailBody: { type: String },
  originalResumeText: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Candidate', CandidateSchema);