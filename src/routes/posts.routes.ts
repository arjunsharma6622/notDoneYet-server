import express from "express";
import {
  addComment,
  createPost,
  deletePost,
  getAllPosts,
  getPostById,
  getPostsByUser,
  getPostsOfAuthenticatedUser,
  getRecommendedPosts,
  togglePostLike
} from "../controllers/posts.controllers";
import { verifyJWT } from "../middleware/auth.middleware";

const router = express.Router();

// get all posts
router.get("/", getAllPosts);

// get post by ID
router.get("/:id", getPostById);

// get posts of a user
router.get("/getPosts/user", getPostsByUser);

// get posts of a user
router.get("/getPosts/authenticated", verifyJWT, getPostsOfAuthenticatedUser);

//get user recommended posts
router.route("/user/recommendedPosts").get(verifyJWT, getRecommendedPosts);

// create a post
router.route("/").post(verifyJWT, createPost);

// toggle post like
router.route("/togglePostLike").post(verifyJWT, togglePostLike);

// create a post
router.route("/addComment").post(verifyJWT, addComment);

// delete post
router.delete("/:id", verifyJWT, deletePost);

export default router;