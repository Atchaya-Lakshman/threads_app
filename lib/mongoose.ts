import mongoose from "mongoose";

let isConnected = false;

interface ConnectionError extends Error {
    name: string;
    message: string;
}

/**
 * Establishes a connection to MongoDB
 * Implements singleton pattern to reuse existing connections
 * @throws Error if MONGODB_URL is not set
 */
export const connectToDB = async (): Promise<void> => {
    if (isConnected) {
        console.debug("Using existing MongoDB connection");
        return;
    }

    const mongodbUrl = process.env.MONGODB_URL;

    if (!mongodbUrl) {
        throw new Error(
            "MONGODB_URL environment variable is not set. Please configure it in your .env.local file"
        );
    }

    mongoose.set("strictQuery", true);

    try {
        await mongoose.connect(mongodbUrl);

        isConnected = true;
        console.log("✓ Connected to MongoDB successfully");
    } catch (error) {
        const connectionError = error as ConnectionError;
        console.error(
            `✗ MongoDB connection failed: ${connectionError.name} - ${connectionError.message}`
        );
        throw new Error(
            `Failed to connect to MongoDB: ${connectionError.message}`
        );
    }
};

/**
 * Closes the MongoDB connection
 * Useful for cleanup in testing or graceful shutdown
 */
export const disconnectFromDB = async (): Promise<void> => {
    if (!isConnected) return;

    try {
        await mongoose.disconnect();
        isConnected = false;
        console.log("✓ Disconnected from MongoDB");
    } catch (error) {
        const disconnectError = error as ConnectionError;
        console.error(
            `✗ Failed to disconnect from MongoDB: ${disconnectError.message}`
        );
        throw new Error(
            `Failed to disconnect from MongoDB: ${disconnectError.message}`
        );
    }
};