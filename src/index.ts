import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import express from "express";
import { User } from "./models/user";
import { Venue } from "./models/venue";
import conversationRoutes from "./routes/conversation";
import imageRoutes from "./routes/images";
import postRoutes from "./routes/posts";
import productRoutes from "./routes/product";
import userRoutes from "./routes/user";
import venueRoutes from "./routes/venue";
import { checkNameAvailability, connectDB } from "./utils/utils";

const app = express();

const corsOptions: CorsOptions = {
  origin: ["http://localhost:3000", "https://notdoneyet.vercel.app"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
dotenv.config();

const PORT = process.env.PORT || 8000;

connectDB();

app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/venue", venueRoutes);
app.use("/api/conversation", conversationRoutes);
app.use("/api/product", productRoutes);
app.use("/api/images", imageRoutes);


app.get("/api/checkUserName", async (req, res) => {
  const { userName } = req.query;
  await checkNameAvailability(User, 'userName', userName as string, res);
});

app.get("/api/checkVenueName", async (req, res) => {
  const { uniqueName } = req.query;
  await checkNameAvailability(Venue, 'uniqueName', uniqueName as string, res);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
