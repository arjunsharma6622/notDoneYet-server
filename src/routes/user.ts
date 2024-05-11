import express, { Request, Response } from "express";
import { User } from "../models/user";
const router = express.Router();

// get all users
router.get("/", async (_req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    console.error(`Error fetching users: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// get user by id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(`Error fetching users: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// get user following
router.get("/following/:id", async (req : Request, res : Response) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).populate("following");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const userFollowings = user.following;
    res.status(200).json(userFollowings);
  } catch (err) {
    console.error(`Error fetching users: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
})

// get recommended users
router.get("/recommended/:id", async (req : Request, res : Response) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).populate("following");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const userFollowings : any = user.following;
    userFollowings.push(userId);
    const recommendedUsers = await User.find({ _id: { $nin: userFollowings } });
    res.status(200).json(recommendedUsers);
  } catch (err) {
    console.error(`Error fetching users: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
})



export default router;
