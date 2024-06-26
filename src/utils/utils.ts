import mongoose from "mongoose";
import { v2 as cloudinary } from 'cloudinary'

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
    console.log(`DB Connected Successfully!!!🙂🚀🚀`);
  } catch (error: any) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export const deleteImageFromCloudinary = async ({ secureUrl }: { secureUrl: string }) => {
  cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  try {    
    const splitUrl = secureUrl.split("/ndy/");
    const publicIdWithExtension = splitUrl[1];
    const lastDotIndex = publicIdWithExtension.lastIndexOf(".");
    const publicId = publicIdWithExtension.substring(0, lastDotIndex);
    const res = await cloudinary.uploader.destroy(`ndy/${publicId}`, {
      invalidate: true,
    });
    return res;
  } catch (err) {
    console.log(err);
    console.log('error in deleting the image from cloudinary');
  }

  return true;
};