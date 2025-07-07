import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const MongoDbConnection = async () => {
  try {
    const connections = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 7000,
      dbName: "todo",
    });
    console.log("MongoDB connected: ", connections.connection.host);
  } catch (error) {
    console.error("MongoDB connection failed: ", error.message);
    process.exit(1);
  }
};

export default MongoDbConnection;
