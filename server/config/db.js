import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // We will store the actual link in a secret .env file later
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1); // Stop the server if DB fails
  }
};

export default connectDB;