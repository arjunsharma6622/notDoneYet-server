import { Document, Schema } from "mongoose";

export interface Comment extends Document {
  user: Schema.Types.ObjectId;
  post: Schema.Types.ObjectId;
  parentComment?: Schema.Types.ObjectId;
  text: string;
  replies?: Schema.Types.ObjectId[];
}

export interface PostDocument extends Document {
  user: Schema.Types.ObjectId;
  description: string;
  images?: string[];
  tags?: string[];
  views?: number;
  shares?: number;
  likes?: Schema.Types.ObjectId[];
  comments?: Schema.Types.ObjectId[];
}
