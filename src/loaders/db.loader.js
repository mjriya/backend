import mongoose from "mongoose"
import { environment } from "./environment.loader.js"

/**
 * Establishing MongoDB connection
 * Using mongoose.connect for primary database connection
 */
const db = async () => {
    try {
        console.log(`🔍 Attempting to connect to MongoDB at: ${environment.MONGO_URI}`);
        
        // Validate MONGO_URI is present
        if (!environment.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }

        await mongoose.connect(environment.MONGO_URI, {
            autoIndex: false,
            // Additional connection options for stability
            serverSelectionTimeoutMS: 5000,
            retryWrites: true
        });
        
        console.log(`✅ Database Connection Successful: Connected to MongoDB at ${environment.MONGO_URI}`);
    } catch (error) {
        console.error("❌ Error connecting to MongoDB:", error.message);
        console.error("Detailed Error:", error);
        
        // Provide more context about potential connection issues
        if (error.name === 'MongoNetworkError') {
            console.error('Network error: Check your internet connection and MongoDB server status');
        } else if (error.name === 'MongoError' && error.code === 18) {
            console.error('Authentication failed: Check your username and password');
        }
        
        // Exit process with failure
        process.exit(1);
    }
}

// Export mongoose for direct use in models
export { mongoose, db }

// Optionally, add some mongoose connection event listeners
mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ Lost MongoDB connection');
});

mongoose.connection.on('reconnected', () => {
    console.log('🔄 Reconnected to MongoDB');
});