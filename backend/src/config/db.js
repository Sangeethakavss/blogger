import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/blogify';

  try {
    // First, attempt connecting to standard MongoDB (e.g. local daemon or Atlas)
    console.log(`📡 Connecting to MongoDB at ${uri}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ MongoDB Connected to: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    console.warn(`⚠️ Standard MongoDB connection failed (${err.message}).`);
    console.log('🔄 Initializing in-memory MongoDB server for zero-config local execution...');

    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`✅ In-Memory MongoDB connected at ${memoryUri}`);
    } catch (memErr) {
      console.error('❌ Failed to start in-memory MongoDB:', memErr.message);
      process.exit(1);
    }
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
