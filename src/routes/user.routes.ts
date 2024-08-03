import express from "express";
import {
  getAllUsers,
  getRecommendedUsers,
  getUserByIdOrUserName,
  getUserFollowing,
  getUserProfileDetails,
  toggleSavePost
} from "../controllers/user.controllers";

const router = express.Router();

// get all users
router.get("/", getAllUsers);

// get user by id or userName using query
router.get("/getUser", getUserByIdOrUserName);

// get user following
router.get("/following/:id", getUserFollowing);

// get user Details using the userName and userRole from query
router.get("/profile/details", getUserProfileDetails);

// get recommended users
router.get("/recommended/:id", getRecommendedUsers);

// update user by userId
router.patch("/:id",);

// save post to user's saved posts
router.post("/post/toggleSavePost", toggleSavePost);

// toggle follow user
router.post("/toggleFollow",);

export default router;