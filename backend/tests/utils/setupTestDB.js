
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

mongoose.set('strictQuery', false); // Optional, depending on your version of Mongoose
mongoose.connection.setMaxListeners(20); // Increases the limit to 20 listeners

let mongoServer;

export const connectDB = async () => {
    if (!mongoServer) {
        mongoServer = await MongoMemoryServer.create();
    }

    const uri = mongoServer.getUri();
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 60000 });
    }
};

export const disconnectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    }

    if (mongoServer) {
        await mongoServer.stop();
        mongoServer = null;
    }
};


export const checkConnection = async () => {
    mongoose.connection.removeAllListeners("error"); // Prevent duplicate listeners
    mongoose.connection.on("error", (err) => {
        console.error("MongoDB connection error:", err);
    });

    if (mongoose.connection.readyState !== 1) {
        console.log("MongoDB connection lost. Reconnecting...");
        await connectDB();
    }
};

export { mongoServer };

