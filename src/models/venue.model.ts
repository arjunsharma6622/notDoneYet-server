import { Schema, model } from "mongoose";
import { Amenity, Review, SocialLink, Sport, Venue as VenueType } from "../types/venue.types";

const ReviewSchema = new Schema<Review>({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  createdAt: { type: Date, default: Date.now },
});

const sportSchema = new Schema<Sport>({
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

const amenitiesSchema = new Schema<Amenity>({
  name: String,
  icon : String,
  category : String,
})

const socialLink = new Schema<SocialLink>({
  name : String,
  link : String
})

const VenueSchema = new Schema<VenueType>({
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
  rating : Number,
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
  phone : String,
  email : String,
  amenities: [amenitiesSchema],
  reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
  sports: [sportSchema],
  posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
}, {timestamps: true});

export const Venue = model("Venue", VenueSchema);