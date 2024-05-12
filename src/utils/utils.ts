import mongoose from "mongoose";

export const BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "https://notdoneyet-server.vercel.app";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURL = process.env.MONGO_URL;
    if (!mongoURL) {
      throw new Error("MongoDB URL is not provided in environment variables");
    }
    await mongoose.connect(mongoURL);
    console.log(`DB Connected Successfully!!!🙂`);
  } catch (error : any) {
      console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
