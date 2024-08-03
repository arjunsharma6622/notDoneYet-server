import express from "express";
import {
  deletePost,
  getAllPosts,
  getPostById,
  getPostsByUser,
  getRecommendedPosts
} from "../controllers/posts.controllers";

const router = express.Router();

// get all posts
router.get("/", getAllPosts);

// get post by ID
router.get("/:id", getPostById);

// get posts of a user
router.get("/getPosts/user", getPostsByUser);

//get user recommended posts
router.get("/recommended/:id", getRecommendedPosts);

// delete post
router.delete("/:id", deletePost);

export default router;