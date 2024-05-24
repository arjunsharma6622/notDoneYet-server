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

/* 
---------------------------------------------------------------
A VENUE_PAGE will be having all the details of that venue like
---------------------------------------------------------------
 - venue banners [offers, advertising, banners related to venue, current events, achievements etc...]
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
  uniqueName : {type: String, unique: true},
  timing: {
    startTime: String,
    endTime: String,
  },

  bookings: [{ type: Schema.Types.ObjectId, ref: "Booking" }],
});

export const Venue = model("Venue", VenueSchema);