import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
dotenv.config();

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

export const cookieOptions: { httpOnly: boolean; secure: boolean; sameSite: "none" | "lax" | "strict" } = {
  httpOnly: true,
  secure: true,
  sameSite: "strict"
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


export const checkNameAvailability = async (Model: mongoose.Model<any>, nameField: string, nameValue: string, res: any) => {
  try {
    if (!nameValue) {
      return res.status(400).json({ error: `${nameField} is required` });
    }
    const item = await Model.findOne({ [nameField]: nameValue });
    if (item) {
      return res
        .status(200)
        .json({ message: `${nameField} is already taken`, available: false });
    }
    return res
      .status(200)
      .json({ message: `${nameField} is available`, available: true });
  } catch (err) {
    console.error(`Error fetching ${nameField}: ${err}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


const secretKey: string = process.env.JWT_SECRET!;
export const createJWTToken = (id: string) => {
  return jwt.sign({ id }, secretKey, {
    expiresIn: 3 * 24 * 60 * 60,
  });
};