import express, {Request, Response} from "express";
import { Post } from "../models/post.model";
import { User } from "../models/user.model";
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
    const post = await Post.findById(postId)
      .populate({
        path: "user",
        select: "name image bio followers following role userName",
      })
      .populate({
        path: "comments",
        populate: { path: "user", select: "name image" },
      })
      .populate({ path: "likes", select: "name image _id" })
      .sort({ createdAt: -1 });

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
// router.get("/user/:id", async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const posts = await Post.find({ user: userId })
//       .populate({ path: "user", select: "name image bio role followers userName" })
//       .populate({
//         path: "comments",
//         populate: { path: "user", select: "name image" },
//       })
//       .populate({ path: "likes", select: "name image" })
//       .sort({ createdAt: -1 });

//     res.status(200).json(posts);
//   } catch (err) {
//     console.error(`Error fetching posts: ${err}`);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

router.get("/getPosts/user", async (req, res) => {
  try {
    const { userId, userName } = req.query;

    if (!userId && !userName) {
      return res.status(400).json({ error: "User ID or User Name not provided" });
    }

    let user;
    if (userId) {
      user = await User.findById(userId);
    } else if (userName) {
      user = await User.findOne({ userName: userName });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = await Post.find({ user: user._id })
      .populate({ path: "user", select: "name image bio role followers userName" })
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
router.get("/recommended/:id", async (req : Request, res : Response) => {
  const userId = req.params.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    // Find the user and populate their following list with only the posts field
    const user = await User.findById(userId)
      .populate({
        path: "following",
        select: "posts",
      })
      .lean();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get the posts from the users that the current user is following
    const followingUserPosts = user?.following?.flatMap((f : any) => f.posts) || [];

    // Find the recommended posts from the users that the current user is following
    const recommendedPosts = await Post.find({
      _id: { $in: followingUserPosts },
    })
      .populate({
        path: "user",
        select: "name image bio role userName followers",
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
      .lean();

    // Find the remaining posts not in followingUserPosts
    const remainingPosts = await Post.find({
      _id: { $nin: [...followingUserPosts]},
      user: { $ne: userId }
    })
      .populate({
        path: "user",
        select: "name image bio role userName followers",
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
      .lean();

    // Combine recommendedPosts and remainingPosts
    const allPosts = [...recommendedPosts, ...remainingPosts];

    // Paginate the combined results
    const paginatedPosts = allPosts.slice((page - 1) * limit, page * limit);

    // Format the posts to include the number of comments and likes
    const formattedPosts = paginatedPosts.map(post => ({
      ...post,
      numComments: post.comments?.length,
      numLikes: post.likes?.length,
    }));

    res.status(200).json(formattedPosts);
  } catch (err) {
    console.error(`Error fetching posts: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// delete post
router.delete("/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findByIdAndDelete(postId);
    res.status(200).json(post);
  } catch (err) {
    console.error(`Error deleting post: ${err}`);
    res.status(500).json({ message: err });
  }
});


export default router;