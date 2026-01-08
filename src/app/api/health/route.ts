import dbConnect from "../../lib/helping/dbconnection";
import mongoose from "mongoose";

export async function GET() {
  try {
    // Check if MONGODB_URI is set (also check for common typo MONGODBDB_URI)
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODBDB_URI;
    
    if (!mongoUri) {
      return Response.json({
        status: "error",
        message: "MONGODB_URI environment variable is not set",
        connected: false,
      }, { status: 500 });
    }

    if (process.env.MONGODBDB_URI && !process.env.MONGODB_URI) {
      console.warn("⚠️  Warning: Using MONGODBDB_URI (typo detected). Please rename to MONGODB_URI in your .env file.");
    }

    // Try to connect
    await dbConnect();

    // Check connection state
    const connectionState = mongoose.connection.readyState;
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    const isConnected = connectionState === 1;

    // Try a simple database operation to verify connection
    let dbOperationSuccess = false;
    let dbOperationError = null;

    try {
      // Try to list collections (lightweight operation)
      await mongoose.connection.db?.admin().ping();
      dbOperationSuccess = true;
    } catch (error: any) {
      dbOperationError = error.message;
    }

    return Response.json({
      status: isConnected && dbOperationSuccess ? "success" : "error",
      connected: isConnected && dbOperationSuccess,
      connectionState: states[connectionState as keyof typeof states] || "unknown",
      connectionStateCode: connectionState,
      database: mongoose.connection.db?.databaseName || "unknown",
      host: mongoose.connection.host || "unknown",
      port: mongoose.connection.port || "unknown",
      dbOperationSuccess,
      dbOperationError: dbOperationError || null,
      message: isConnected && dbOperationSuccess
        ? "MongoDB is connected and operational"
        : `MongoDB connection issue: ${dbOperationError || "Connection state: " + states[connectionState as keyof typeof states]}`,
    }, { status: isConnected && dbOperationSuccess ? 200 : 500 });

  } catch (error: any) {
    return Response.json({
      status: "error",
      connected: false,
      message: error.message || "Failed to connect to MongoDB",
      error: error.message,
    }, { status: 500 });
  }
}

