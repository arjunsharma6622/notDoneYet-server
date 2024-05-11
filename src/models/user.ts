import mongoose, {Document} from "mongoose";

export interface Experience {
  title: string;
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
  password?: string;
  googleId?: string;
  image: string;
  backgroundImg: string;
  role: "user" | "doctor" | "athlete" | "venueOwner" | "brand" | "root";
  venues?: mongoose.Schema.Types.ObjectId[];
  about?: string;
  bio?: string;
  posts?: mongoose.Schema.Types.ObjectId[];
  followers?: mongoose.Schema.Types.ObjectId[];
  following?: mongoose.Schema.Types.ObjectId[];
  experience?: Experience[];
  education?: Education[];
  sports?: string[];
  skills?: string[];
  address?: object;
  phone?: string;
  profileLikes?: mongoose.Schema.Types.ObjectId[];
  likedProfiles?: mongoose.Schema.Types.ObjectId[];
  conversations?: mongoose.Schema.Types.ObjectId[];
}

const experienceSchema = new mongoose.Schema<Experience>(
  {
    title: { type: String, required: true },
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
  { timestamps: true },
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
  { timestamps: true },
);

const userSchema = new mongoose.Schema<UserDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
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
      "https://www.fr.com/images/demo/fish-richardson-header-default.png",
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "doctor", "athlete", "venueOwner", "brand", "root"],
  },
  profileLikes : [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
  likedProfiles : [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
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
  conversations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Conversation" }],
});

export const User = mongoose.model<UserDocument>("User", userSchema);