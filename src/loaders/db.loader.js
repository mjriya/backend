import mongoose from "mongoose";
import { environment } from "./environment.loader.js";

// Connection state tracking
let isConnected = false;
let connectionRetries = 0;
const MAX_RETRIES = 3;

// Cache the connection for serverless environments
let cachedConnection = null;

/**
 * Enhanced MongoDB connection handler with:
 * - Serverless optimization
 * - Connection caching
 * - Retry logic
 * - Detailed error handling
 */
const db = async () => {
  // Return cached connection if available
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    if (!environment.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    // Enhanced connection options for production
    const connectionOptions = {
      autoIndex: environment.NODE_ENV === 'development', // Only autoIndex in dev
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      retryReads: true,
      maxPoolSize: 10, // Optimal for serverless
      minPoolSize: 2,
      heartbeatFrequencyMS: 10000,
    };

    const connection = await mongoose.connect(environment.MONGO_URI, connectionOptions);
    
    isConnected = true;
    connectionRetries = 0;
    cachedConnection = connection;
    
    console.log('✅ MongoDB connected successfully');
    return connection;
  } catch (error) {
    connectionRetries++;
    
    if (connectionRetries < MAX_RETRIES) {
      console.warn(`⚠️ Connection attempt ${connectionRetries} failed. Retrying...`);
      await new Promise(resolve => setTimeout(resolve, 2000 * connectionRetries));
      return db();
    }

    console.error("💥 MongoDB connection failed after retries:", {
      error: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });

    // Graceful shutdown
    process.exitCode = 1;
    throw error;
  }
};

// Connection event listeners
mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('🟢 MongoDB connection established');
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('⚠️ MongoDB connection lost');
  // Attempt reconnection
  if (!process.exitCode) {
    setTimeout(() => db(), 5000);
  }
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('🔄 MongoDB reconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Graceful shutdown handler
const shutdown = async () => {
  try {
    await mongoose.connection.close();
    console.log('🛑 MongoDB connection closed gracefully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error closing MongoDB connection:', err);
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Export mongoose and enhanced db function
export { mongoose, db };

/**
 * Utility function to check connection status
 */
export const checkConnection = () => {
  return {
    isConnected,
    readyState: mongoose.connection.readyState,
    retries: connectionRetries,
    lastError: mongoose.connection._lastError
  };
};