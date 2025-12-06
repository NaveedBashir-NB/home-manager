import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ Please add MONGODB_URI to your environment variables.");
}

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  const db = await mongoose.connect(MONGODB_URI, {
    dbName: "home_manager",
  });

  isConnected = db.connections[0].readyState;
}
