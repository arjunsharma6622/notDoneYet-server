import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import express from "express";
import { User } from "./models/user.model";
import { Venue } from "./models/venue.model";
import authRoutes from "./routes/auth.routes";
import conversationRoutes from "./routes/conversation.routes";
import imageRoutes from "./routes/images.routes";
import postRoutes from "./routes/posts.routes";
import productRoutes from "./routes/product.routes";
import userRoutes from "./routes/user.routes";
import venueRoutes from "./routes/venue.routes";
import cookieParser = require("cookie-parser");

import { googleOauthHandler } from "./controllers/auth.controllers";
import { checkNameAvailability, connectDB } from "./utils/utils";

const app = express();


const corsOptions: CorsOptions = {
  origin: ["http://localhost:3000", "https://notdoneyet.in", "https://www.notdoneyet.in", "https://notdoneyet.vercel.app", "*"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
dotenv.config();

const PORT = process.env.PORT || 8000;

connectDB();

app.use("/auth", authRoutes)
app.use("/user", userRoutes);
app.use("/posts", postRoutes);
app.use("/venue", venueRoutes);
app.use("/conversation", conversationRoutes);
app.use("/product", productRoutes);
app.use("/images", imageRoutes);

app.get("/auth/google", googleOauthHandler);


app.get("/checkUserName", async (req, res) => {
  const { userName } = req.query;
  await checkNameAvailability(User, 'userName', userName as string, res);
});

app.get("/checkVenueName", async (req, res) => {
  const { uniqueName } = req.query;
  await checkNameAvailability(Venue, 'uniqueName', uniqueName as string, res);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});