import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { connectDB } from "./utils/utils";
import userRoutes from "./routes/user";
import cors, { CorsOptions } from "cors";

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

app.listen(8000, () => {
  console.log(`Server running on port ${PORT}`);
});
