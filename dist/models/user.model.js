"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const experienceSchema = new mongoose_1.default.Schema({
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
}, { timestamps: true });
const educationSchema = new mongoose_1.default.Schema({
    school: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    gpa: { type: Number },
    description: { type: String },
}, { timestamps: true });
const userSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    userName: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, select: false },
    googleId: { type: String },
    image: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    },
    backgroundImg: {
        type: String,
        default: "https://www.beautylabinternational.com/wp-content/uploads/2020/03/Hero-Banner-Placeholder-Light-1024x480-1.png",
    },
    role: {
        type: String,
        default: "user",
        enum: ["user", "doctor", "athlete", "venue", "brand", "root"],
    },
    profileLikes: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    likedProfiles: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        postalCode: { type: String },
    },
    venues: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Venue" }],
    about: { type: String },
    bio: { type: String },
    posts: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Post" }],
    followers: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    experience: [experienceSchema],
    education: [educationSchema],
    sports: [String],
    skills: [String],
    conversations: [
        { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Conversation" },
    ],
    products: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Product" }],
    savedPosts: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Post" }]
});
// isPasswordCorrect
userSchema.methods.isPasswordCorrect = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        return bcryptjs_1.default.compare(password, this.password);
    });
};
// generateAccessToken
userSchema.methods.generateAccessToken = function () {
    return jsonwebtoken_1.default.sign({ _id: this._id, email: this.email, userName: this.userName }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
};
// generateRefreshToken
userSchema.methods.generateRefreshToken = function () {
    return jsonwebtoken_1.default.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
};
exports.User = mongoose_1.default.model("User", userSchema);
