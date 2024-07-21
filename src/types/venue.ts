import { Document, Schema } from "mongoose";

export interface Review {
  user: Schema.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface Sport {
  name: string;
  description: string;
  images: string[];
  price: number;
  bookings: Schema.Types.ObjectId[];
  timing: {
    startTime: string;
    endTime: string;
    startDay: string;
    endDay: string;
  };
}

export interface Amenity {
  name: string;
  icon: string;
  category: string;
}

export interface SocialLink {
  name: string;
  link: string;
}

export interface Venue extends Document {
  name: string;
  location: {
    address: string;
    city: string;
    landmark?: string;
    state: string;
    country: string;
    zipCode: string;
  };
  bio?: string;
  followers: Schema.Types.ObjectId[];
  profileLikes: Schema.Types.ObjectId[];
  ratings: Review[];
  rating?: number;
  previousEvents: Schema.Types.ObjectId[];
  googleMapsLink?: string;
  images: string[];
  description?: string;
  socialLinks: SocialLink[];
  owner: Schema.Types.ObjectId;
  uniqueName: string;
  timing: {
    startTime: string;
    endTime: string;
  };
  number: string;
  email: string;
  amenities: Amenity[];
  reviews: Schema.Types.ObjectId[];
  sports: Sport[];
  posts: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}