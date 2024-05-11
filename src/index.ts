import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { connectDB } from "./utils/utils";
import userRoutes from "./routes/user";

dotenv.config();
const app = express()

const PORT = process.env.PORT || 8000

connectDB()

app.get("/", (_req : Request, res : Response) => {
    return res.send("Hello World")
})

app.use("/api/user", userRoutes)

app.listen(8000, () => {
    console.log(`Server running on port ${PORT}`)
})