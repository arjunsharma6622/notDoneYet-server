import { Document, Schema } from "mongoose";

export interface Experience {
  title: string;
  type: string,
  description?: string;
  location?: string;
  duration?: string;
  mediaAttachments?: {
    links?: string;
    images?: string;
  }[];
  outcome?: "win" | "loss" | "draw" | "";
  potition?: string;
  healthInjury?: string;
  organization?: string;
  coach?: string;
  sport?: string;
  date?: Date;
  startDate?: Date;
  endDate?: Date;
  current?: boolean;
  specialization?: string;
}

export interface Education {
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate: Date;
  gpa?: number;
  description?: string;
}

export interface UserDocument extends Document {
  name: string;
  email: string;
  userName: string;
  password?: string;
  googleId?: string;
  image: string;
  backgroundImg: string;
  role: "user" | "doctor" | "athlete" | "venue" | "brand" | "root";
  venues?: Schema.Types.ObjectId[];
  about?: string;
  bio?: string;
  posts?: Schema.Types.ObjectId[];
  followers?: Schema.Types.ObjectId[];
  following?: Schema.Types.ObjectId[];
  experience?: Experience[];
  education?: Education[];
  skills?: string[];
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  phone?: string;
  profileLikes?: Schema.Types.ObjectId[];
  likedProfiles?: Schema.Types.ObjectId[];
  conversations?: Schema.Types.ObjectId[];
  products: Schema.Types.ObjectId[];
  savedPosts : Schema.Types.ObjectId[];
  refreshToken : string;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken() : string;
}