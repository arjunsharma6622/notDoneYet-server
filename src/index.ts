import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { connectDB, deleteImageFromCloudinary } from "./utils/utils";
import userRoutes from "./routes/user";
import postRoutes from "./routes/posts";
import venueRoutes from "./routes/venue";
import conversationRoutes from "./routes/conversation";
import productRoutes from "./routes/product";
import cors, { CorsOptions } from "cors";
import { User } from "./models/user";
import { Venue } from "./models/venue";
import { v2 as cloudinary } from "cloudinary";

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
      return res
        .status(200)
        .json({ message: "User Name is already taken", available: false });
    }
    return res
      .status(200)
      .json({ message: "User Name is available", available: true });
  } catch (err) {
    console.error(`Error fetching users: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// check unique name available
app.get("/api/checkVenueName", async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ error: "Venue Name is required" });
    }
    const venue = await Venue.findOne({ uniqueName: name});
    if (venue) {
      return res
        .status(200)
        .json({ message: "Venue Name is already taken", available: false });
    }
    return res
      .status(200)
      .json({ message: "Venue Name is available", available: true });
  } catch (err) {
    console.error(`Error fetching venues: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/images/deleteImage", async (req, res) => {
  try {
    const { imageUrl } = req.query;
    if (!imageUrl) {
      return res.status(400).json({ error: "Image URL is required" });
    }
    const cldRes = await deleteImageFromCloudinary({
      secureUrl: imageUrl as string,
    });
    return res
      .status(200)
      .json({ ...cldRes, message: "Image deleted successfully" });
  } catch (err) {
    console.error(`Error deleting image: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/images/deleteFolder", async (req, res) => {
  try {
    cloudinary.config({ 
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
      api_key: process.env.CLOUDINARY_API_KEY, 
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    const { folderName } = req.query;
    console.log(folderName);
    if (!folderName) {
      return res.status(400).json({ error: "Folder Name is required" });
    }
    const cldRes = await cloudinary.api.delete_resources_by_prefix('my_folder/');
    console.log(cldRes);
    return res
      .status(200)
      .json({ ...cldRes, message: "Folder deleted successfully" });
  } catch (err) {
    console.error(`Error deleting folder: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(8000, () => {
  console.log(`Server running on port ${PORT}`);
});
