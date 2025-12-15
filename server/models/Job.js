import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  userId: {
    type: String, // e.g. "user_2p9..."
    required: true,
    index: true // Makes finding user's jobs fast
  },
  
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Job', JobSchema);