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
  togglePostLike,
} from "../controllers/posts.controllers";
import { verifyJWT } from "../middleware/auth.middleware";

const router = express.Router();

// get all posts
router.route("/").get(getAllPosts);

// create a post
router.route("/").post(verifyJWT, createPost);

// get post by ID
router.route("/:id").get(getPostById);

// delete post by ID
router.route("/:id").delete(verifyJWT, deletePost);

// get posts of a user
router.route("/getPosts/user").get(getPostsByUser);

// get posts of the authenticated user
router.route("/getPosts/authenticated").get(verifyJWT, getPostsOfAuthenticatedUser);

// get user recommended posts
router.route("/user/recommendedPosts").get(verifyJWT, getRecommendedPosts);

// toggle post like
router.route("/togglePostLike").post(verifyJWT, togglePostLike);

// add comment
router.route("/addComment").post(verifyJWT, addComment);

export default router;