import express from "express";
import { Post } from "../models/post";
import { User } from "../models/user";
const router = express.Router();

// get all posts
router.get("/", async (_req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (err) {
    console.error(`Error fetching posts: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// get post by ID
router.get("/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(200).json(post);
  } catch (err) {
    console.error(`Error fetching posts: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// get user posts by userId
router.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const posts = await Post.find({ user: userId })
      .populate({ path: "user", select: "name image bio role" })
      .populate({
        path: "comments",
        populate: { path: "user", select: "name image" },
      })
      .populate({ path: "likes", select: "name image" })
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    console.error(`Error fetching posts: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//get user recommended posts
router.get("/recommended/:id", async (req, res) => {
  const userId = req.params.id;
  const page = 1;
  const limit = 10;
  try {
    // Find the user and populate their following list with only the posts field
    const user: any = await User.findById(userId)
      .populate({
        path: "following",
        select: "posts",
      })
      .lean();

    // Get the posts from the users that the current user is following
    const followingUserPosts = user?.following?.flatMap((f: any) => f.posts);

    // Find the recommended posts and populate the user and comments fields
    const recommendedPosts = await Post.find({
      _id: { $in: followingUserPosts },
      createdAt: { $gte: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000) },
    })
      .populate({
        path: "user",
        select: "name image bio",
      })
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "name image bio role _id",
        },
      })
      .populate({ path: "likes", select: "name image _id" })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Format the recommended posts to include the number of comments and likes
    const formattedRecommendedPosts = recommendedPosts.map((post) => ({
      ...post,
      numComments: post.comments.length,
      numLikes: post.likes.length,
    }));

    res.status(200).json(recommendedPosts);
  } catch (err) {
    console.error(`Error fetching posts: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
