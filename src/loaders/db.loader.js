import mongoose from "mongoose";
import { environment } from "./environment.loader.js";

// Connection state tracking
let isConnected = false;
let connectionRetries = 0;
const MAX_RETRIES = 3;

// Cache the connection for serverless environments
let cachedConnection = null;

// Connection statistics
const connectionStats = {
  totalOperations: 0,
  failedOperations: 0,
  poolAcquisitionTime: 0,
  lastOperationTime: null
};

/**
 * Enhanced MongoDB connection handler with:
 * - Serverless optimization
 * - Connection caching
 * - Retry logic
 * - Detailed error handling
 * - Timeout protection
 * - Connection pool monitoring
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
      serverSelectionTimeoutMS: 30000,  // Increased from 5000ms
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      retryReads: true,
      maxPoolSize: 50,  // Increased from 10
      minPoolSize: 5,   // Increased from 2
      heartbeatFrequencyMS: 10000,
      waitQueueTimeoutMS: 20000,  // Timeout for getting a connection from pool
      maxIdleTimeMS: 60000,       // Close idle connections after 60s
      minHeartbeatFrequencyMS: 5000 // Minimum time between heartbeats
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

// ==============================================
// Connection Event Listeners
// ==============================================

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

// Connection pool monitoring events
mongoose.connection.on('connectionPoolReady', () => {
  console.log('🔵 Connection pool ready');
});

mongoose.connection.on('connectionPoolCreated', (event) => {
  console.log('🔵 Connection pool created:', event);
});

mongoose.connection.on('connectionPoolClosed', (event) => {
  console.log('🔵 Connection pool closed:', event);
});

mongoose.connection.on('connectionCreated', () => {
  console.log('🔵 New connection created');
});

mongoose.connection.on('connectionCheckedOut', () => {
  connectionStats.totalOperations++;
  connectionStats.lastOperationTime = new Date();
  console.log('🔵 Connection checked out');
});

mongoose.connection.on('connectionCheckedIn', () => {
  console.log('🔵 Connection checked in');
});

// ==============================================
// Graceful Shutdown Handler
// ==============================================

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

// ==============================================
// Utility Functions
// ==============================================

/**
 * Enhanced connection status checker
 */
export const checkConnection = () => {
  const connection = mongoose.connection;
  const client = connection?.getClient();
  
  return {
    isConnected,
    readyState: connection.readyState,
    retries: connectionRetries,
    lastError: connection._lastError,
    poolSize: connection.poolSize,
    availableConnections: connection.base?.connections?.length || 0,
    serverSelectionTimeoutMS: client?.s?.options?.serverSelectionTimeoutMS,
    waitQueueTimeoutMS: client?.s?.options?.waitQueueTimeoutMS,
    stats: {
      ...connectionStats,
      currentPoolSize: client?.s?.pool?.currentPoolSize,
      waitQueueSize: client?.s?.pool?.waitQueueSize,
      totalConnectionCount: client?.s?.pool?.totalConnectionCount
    }
  };
};

/**
 * Middleware to add timeout to operations
 */
export const withTimeout = (operation, timeoutMs = 20000) => {
  return operation.maxTimeMS(timeoutMs).exec();
};

/**
 * Health check function
 */
export const checkHealth = async () => {
  try {
    const start = Date.now();
    await mongoose.connection.db.admin().ping();
    const latency = Date.now() - start;
    
    return {
      healthy: true,
      latency,
      ...checkConnection()
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      ...checkConnection()
    };
  }
};

// Export mongoose and enhanced db function
export { mongoose, db };