"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Venue = void 0;
const mongoose_1 = require("mongoose");
const ReviewSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
    createdAt: { type: Date, default: Date.now },
});
const sportSchema = new mongoose_1.Schema({
    name: String,
    description: String,
    images: [String],
    price: Number,
    bookings: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Booking" }],
    timing: {
        startTime: String,
        endTime: String,
        startDay: String,
        endDay: String
    }
});
const amenitiesSchema = new mongoose_1.Schema({
    name: String,
    icon: String,
    category: String,
});
const socialLink = new mongoose_1.Schema({
    name: String,
    link: String
});
const VenueSchema = new mongoose_1.Schema({
    name: String,
    location: {
        address: String,
        city: String,
        landmark: String,
        state: String,
        country: String,
        zipCode: String,
    },
    bio: String,
    followers: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    profileLikes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    ratings: [ReviewSchema],
    rating: Number,
    previousEvents: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Event" }],
    googleMapsLink: String,
    images: [String],
    description: String,
    socialLinks: [socialLink],
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    uniqueName: { type: String, unique: true },
    timing: {
        startTime: String,
        endTime: String,
    },
    number: String,
    email: String,
    amenities: [amenitiesSchema],
    reviews: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Review" }],
    sports: [sportSchema],
    posts: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Post" }],
}, { timestamps: true });
exports.Venue = (0, mongoose_1.model)("Venue", VenueSchema);
