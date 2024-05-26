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
/*
---------------------------------------------------------------
A VENUE_PAGE will be having all the details of that venue like
---------------------------------------------------------------
 - name, description, location, contact details [phone, whatsapp, mail, social links], GMaps
 - owner name
 - venue images, videos, media
 - amamenities
 - sports [here all the sports available to play in venue will be listed like basketball, swimming etc...]
    --------------------------
    - SPORTS STRUCTURE will be
    --------------------------
      - Name of the sport
      - Images of it
      - Dimensions of the pitch, ground, area depending on the sport
      - Availability, slots
      - pricing [per hr, or anything depending on venue owner]
 - It's Previous Events, bookings
 - Ratings and Reviews
*/
const sportSchema = new mongoose_1.Schema({
    name: String,
    images: [String],
    slots: Number,
    pricing: [PricingSchema],
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
    uniqueName: { type: String, unique: true },
    timing: {
        startTime: String,
        endTime: String,
    },
    number: { type: Number, default: 0 },
    amenities: [String],
    sports: [String],
    reviews: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Review" }],
    bookings: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Booking" }],
}, { timestamps: true });
exports.Venue = (0, mongoose_1.model)("Venue", VenueSchema);
