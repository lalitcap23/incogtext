import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
    // Check if already connected
    if (connection.isConnected === 1) {
        console.log("MongoDB is already connected");
        return;
    }

    // Check if connection is in progress
    if (mongoose.connection.readyState === 1) {
        connection.isConnected = 1;
        console.log("MongoDB is already connected");
        return;
    }

    // Check if MONGODB_URI is provided (also check for common typo MONGODBDB_URI)
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODBDB_URI;
    
    if (!mongoUri) {
        throw new Error("MONGODB_URI environment variable is not set");
    }

    if (process.env.MONGODBDB_URI && !process.env.MONGODB_URI) {
        console.warn("⚠️  Warning: Using MONGODBDB_URI (typo detected). Please rename to MONGODB_URI in your .env file.");
    }

    try {
        // Connect to MongoDB
        const db = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        });
        
        connection.isConnected = db.connections[0].readyState;
        
        console.log("MongoDB connected successfully");
        console.log(`Database: ${db.connection.db?.databaseName || 'unknown'}`);
        console.log(`Host: ${db.connection.host || 'unknown'}`);
        console.log(`Port: ${db.connection.port || 'unknown'}`);
        
        // Handle connection events
        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected');
            connection.isConnected = 1;
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            connection.isConnected = 0;
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            connection.isConnected = 0;
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("MongoDB connection error:", errorMessage);
        connection.isConnected = 0;
        throw error;
    }
}

export default dbConnect;
