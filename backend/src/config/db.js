import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("MONGO_URI:", process.env.MONGO_URI ? "FOUND ✅" : "MISSING ❌");

    await mongoose.connect(process.env.MONGO_URI, { dbName: 'kynara' });
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
