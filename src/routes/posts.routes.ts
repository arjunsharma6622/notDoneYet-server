import express from "express";
import {
  deletePost,
  getAllPosts,
  getPostById,
  getPostsByUser,
  getRecommendedPosts
} from "../controllers/posts.controllers";
import { verifyJWT } from "../middleware/auth.middleware";

const router = express.Router();

// get all posts
router.get("/", getAllPosts);

// get post by ID
router.get("/:id", getPostById);

// get posts of a user
router.get("/getPosts/user", getPostsByUser);

//get user recommended posts
router.get("/user/recommendedPosts", verifyJWT, getRecommendedPosts);

// delete post
router.delete("/:id", deletePost);

export default router;