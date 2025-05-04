import express from "express";
import cors from "cors";
import compression from "compression";
import Joi from "joi";
import { initRoutes } from "./routes/index.js";
import { environment } from "./loaders/environment.loader.js";
import { db } from "./loaders/db.loader.js";

const port = environment.PORT;
const { ValidationError } = Joi;
const app = express();
const isServerless = !!process.env.VERCEL;

// Database connection management
let dbConnection;
let connectionAttempts = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

// Enhanced database connection with retries
const connectDatabase = async () => {
  if (!dbConnection && connectionAttempts < MAX_RETRIES) {
    try {
      dbConnection = await db();
      connectionAttempts = 0;
      console.log("Database connected successfully");
      return dbConnection;
    } catch (error) {
      connectionAttempts++;
      console.error(`Database connection failed (attempt ${connectionAttempts}):`, error.message);
      
      if (connectionAttempts < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return connectDatabase();
      }
      
      console.error("Max connection attempts reached");
      if (!isServerless) process.exit(1);
      throw error;
    }
  }
  return dbConnection;
};

// Middlewares
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    if (dbConnection) {
      // Ping database to verify connection
      await dbConnection.db.admin().ping();
      res.json({ 
        status: 'healthy', 
        db: 'connected',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({ status: 'unhealthy', db: 'disconnected' });
    }
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      error: error.message,
      dbStatus: 'connection failed'
    });
  }
});

// Database connection middleware for serverless
app.use(async (req, res, next) => {
  if (!isServerless) return next();
  
  try {
    if (!dbConnection) {
      await connectDatabase();
    }
    next();
  } catch (error) {
    res.status(503).json({ 
      error: "Service unavailable", 
      details: "Database connection failed"
    });
  }
});

// Initialize routes
initRoutes(app);

// Error handling middleware
app.use((err, req, res, next) => {
  if (environment.SHOW_ADMIN) {
    console.error("Error:", err);
  }
  
  // Handle Joi validation errors
  if (err instanceof ValidationError) {
    return res.status(400).json({
      statusCode: 400,
      message: "Validation error",
      errors: err.details.map(d => d.message)
    });
  }
  
  // Handle database errors
  if (err.name === 'MongoError' || err.name === 'MongooseError') {
    // Reset connection on certain errors
    if (['ETIMEDOUT', 'ECONNREFUSED', 'ENOTFOUND'].includes(err.code)) {
      dbConnection = null;
    }
    return res.status(503).json({
      statusCode: 503,
      message: "Database error occurred",
      ...(environment.NODE_ENV === 'development' && { error: err.message })
    });
  }
  
  // Default error handling
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    statusCode,
    message: environment.NODE_ENV === 'development' ? 
      err.message : 
      'Something went wrong. Please contact the administrator',
    ...(environment.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server only if not in serverless environment
if (!isServerless) {
  connectDatabase().then(() => {
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('Shutting down gracefully...');
      server.close(async () => {
        if (dbConnection) {
          await dbConnection.close();
          console.log('Database connection closed');
        }
        console.log('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  }).catch(error => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
}

// Vercel serverless function handler
const handler = async (req, res) => {
  try {
    if (!dbConnection) {
      await connectDatabase();
    }
    return app(req, res);
  } catch (error) {
    console.error("Request handling failed:", error);
    return res.status(503).json({ 
      error: "Service unavailable",
      ...(environment.NODE_ENV === 'development' && { 
        details: error.message 
      })
    });
  }
};

export default handler;