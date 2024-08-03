import mongoose, { Document } from "mongoose";
import { Education, Experience, UserDocument } from "../types/user.types";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"


const experienceSchema = new mongoose.Schema<Experience>(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ["training", "tournament"] },
    description: { type: String },
    location: { type: String },
    duration: { type: String },
    mediaAttachments: [
      {
        links: { type: String },
        images: { type: String },
      },
    ],
    outcome: {
      type: String,
      enum: ["win", "loss", "draw", ""],
    },
    potition: { type: String },
    healthInjury: { type: String },
    organization: { type: String },
    coach: { type: String },
    sport: { type: String },
    date: { type: Date },
    startDate: { type: Date },
    endDate: { type: Date },
    current: { type: Boolean },
    specialization: { type: String },
  },
  { timestamps: true }
);

const educationSchema = new mongoose.Schema<Education>(
  {
    school: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    gpa: { type: Number },
    description: { type: String },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema<UserDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  userName: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, select: false },
  googleId: { type: String },
  image: {
    type: String,
    default:
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
  },
  backgroundImg: {
    type: String,
    default:
      "https://www.beautylabinternational.com/wp-content/uploads/2020/03/Hero-Banner-Placeholder-Light-1024x480-1.png",
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "doctor", "athlete", "venue", "brand", "root"],
  },
  profileLikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  likedProfiles: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    postalCode: { type: String },
  },
  venues: [{ type: mongoose.Schema.Types.ObjectId, ref: "Venue" }],
  about: { type: String },
  bio: { type: String },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  experience: [experienceSchema],
  education: [educationSchema],
  sports: [String],
  skills: [String],
  conversations: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
  ],
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  savedPosts : [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  refreshToken : { type : String }
});

// isPasswordCorrect
userSchema.methods.isPasswordCorrect = async function (password: string){
  return bcrypt.compare(password, this.password)
}

// generateAccessToken
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id : this._id, email : this.email, userName : this.userName },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  )
}

// generateRefreshToken
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id : this._id },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  )
}


export const User = mongoose.model<UserDocument>("User", userSchema);
