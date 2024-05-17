import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { connectDB } from "./utils/utils";
import userRoutes from "./routes/user";
import postRoutes from "./routes/posts";
import venueRoutes from "./routes/venue";
import conversationRoutes from "./routes/conversation";
import productRoutes from "./routes/product";
import cors, { CorsOptions } from "cors";
import { User } from "./models/user";

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

app.get("/", (_req: Request, res: Response) => {
  return res.send("Hello World");
});

app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/venue", venueRoutes);
app.use("/api/conversation", conversationRoutes);
app.use("/api/product", productRoutes);

app.get("/api/checkUserName", async (req, res) => {
  try {
    const { userName } = req.query;
    if (!userName) {
      return res.status(400).json({ error: "User Name is required" });
    }
    const user = await User.findOne({ userName });
    if (user) {
      return res.status(200).json({ message: "User Name is already taken", available : false });
    }
    return res.status(200).json({ message: "User Name is available", available : true });
  } catch (err) {
    console.error(`Error fetching users: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(8000, () => {
  console.log(`Server running on port ${PORT}`);
});