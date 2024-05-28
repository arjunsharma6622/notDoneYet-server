import { Schema, model } from "mongoose";

// const PricingSchema = new Schema({
//   type: { type: String, enum: ["hourly", "daily"], required: true },
//   price: Number,
// });

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

const sportSchema = new Schema({
  name: String,
  description: String,
  images: [String],
  price: Number,
  bookings :  [{ type: Schema.Types.ObjectId, ref: "Booking" }],
  timing : {
    startTime: String,
    endTime : String,
    startDay : String,
    endDay : String
  }
})

const amenitiesSchema = new Schema({
  name: String,
  icon : String,
  category : String
})

const socialLink = new Schema({
  name : String,
  link : String
})

const VenueSchema = new Schema({
  name: String,
  location: {
    address: String,
    city: String,
    landmark : String,
    state: String,
    country: String,
    zipCode: String,
  },
  bio : String,
  followers : [{type: Schema.Types.ObjectId, ref: "User"}],
  profileLikes : [{type: Schema.Types.ObjectId, ref: "User"}],
  ratings: [ReviewSchema],
  previousEvents: [{ type: Schema.Types.ObjectId, ref: "Event" }],
  googleMapsLink: String,
  images: [String],
  description: String,
  socialLinks : [socialLink],
  owner: { type: Schema.Types.ObjectId, ref: "User" },
  uniqueName : {type: String, unique: true},
  timing: {
    startTime: String,
    endTime: String,
  },
  number : String,
  email : String,
  amenities: [amenitiesSchema],
  reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
  sports: [sportSchema],
  posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
}, {timestamps: true});

export const Venue = model("Venue", VenueSchema);