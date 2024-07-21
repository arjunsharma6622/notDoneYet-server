import mongoose, {Document} from 'mongoose'

export interface productDocument extends Document {
    name: string;
    images: string[];
    category: string;
    tags: string[];
    gender: "male" | "female" | "unisex";
    description: string;
    ratings: number;
    stock: {
      size: string;
      quantity: number;
    }[];
    totalStock: number;
    pricing: {
      originalPrice: number;
      presentPrice: number;
      discount: number;
    };
    sizes: string[];
    reviews: string[];
    user : mongoose.Schema.Types.ObjectId;
  }