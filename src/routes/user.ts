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
router.get("/following/:id", async (req: Request, res: Response) => {
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
});

// get user Details using the userName and userRole from query
router.get("/profile/details", async (req: Request, res: Response) => {
  try {
    let { role, userName } = req.query;

    const user = await User.findOne({ role, userName });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(`Error fetching users: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// get recommended users
router.get("/recommended/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).populate("following");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const userFollowings: any = user.following;
    userFollowings.push(userId);
    const recommendedUsers = await User.find({ _id: { $nin: userFollowings } });
    res.status(200).json(recommendedUsers);
  } catch (err) {
    console.error(`Error fetching users: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// update user by userId
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(`Error updating user: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// save post to user's saved posts
router.post("/post/toggleSavePost", async (req: Request, res: Response) => {
  try {
    const { userId, postId } = req.body;
    let message = ''
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // check if post is already saved
    if(user.savedPosts.includes(postId)){
      const finalPosts = user.savedPosts.filter((id) => id.toString() !== postId);
      user.savedPosts = finalPosts;
      message = 'Post removed from saved posts'
    } else {
      user.savedPosts.push(postId);
      message = 'Post added to saved posts'
    }
    await user.save();
    res.status(200).json({message});
  } catch (err) {
    console.error(`Error updating user: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


export default router;
