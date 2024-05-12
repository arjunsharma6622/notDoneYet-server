import { Schema, model } from "mongoose";

const PricingSchema = new Schema({
  type: { type: String, enum: ["hourly", "daily"], required: true },
  price: Number,
});

const ReviewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  createdAt: { type: Date, default: Date.now },
});

const VenueSchema = new Schema({
  name: String,
  location: {
    city: String,
    state: String,
    country: String,
    address: String,
    zipCode: Number,
  },
  ratings: [ReviewSchema],
  previousEvents: [{ type: Schema.Types.ObjectId, ref: "Event" }],
  googleMapsLink: String,
  images: [String],
  description: String,
  owner: { type: Schema.Types.ObjectId, ref: "User" },
  pricing: [PricingSchema],

  timing: {
    startTime: String,
    endTime: String,
  },

  bookings: [{ type: Schema.Types.ObjectId, ref: "Booking" }],
});

export const Venue = model("Venue", VenueSchema);