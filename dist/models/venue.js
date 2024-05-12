"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Venue = void 0;
const mongoose_1 = require("mongoose");
const PricingSchema = new mongoose_1.Schema({
    type: { type: String, enum: ["hourly", "daily"], required: true },
    price: Number,
});
const ReviewSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
    createdAt: { type: Date, default: Date.now },
});
const VenueSchema = new mongoose_1.Schema({
    name: String,
    location: {
        city: String,
        state: String,
        country: String,
        address: String,
        zipCode: Number,
    },
    ratings: [ReviewSchema],
    previousEvents: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Event" }],
    googleMapsLink: String,
    images: [String],
    description: String,
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    pricing: [PricingSchema],
    timing: {
        startTime: String,
        endTime: String,
    },
    bookings: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Booking" }],
});
exports.Venue = (0, mongoose_1.model)("Venue", VenueSchema);
