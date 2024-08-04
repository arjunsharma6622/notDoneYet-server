import express from "express";
import {
  getAllUsers,
  getAuthenticatedUser,
  getRecommendedUsers,
  getUserByIdOrUserName,
  getUserFollowing,
  getUserProfileDetails,
  toggleFollowUser,
  toggleSavePost
} from "../controllers/user.controllers";
import { verifyJWT } from "../middleware/auth.middleware";

const router = express.Router();


// get all users
router.get("/", getAllUsers);

// get user by id or userName using query
router.get("/getUser", getUserByIdOrUserName);

// get user Details using the userName and userRole from query
router.get("/profile/details", getUserProfileDetails);

// update user by userId
router.patch("/:id",);

// save post to user's saved posts
router.post("/post/toggleSavePost", toggleSavePost);

/* --- SECURED ROUTES --- */

// get authenticated dashboard user details via the access token
router.get('/authenticatedUser', verifyJWT, getAuthenticatedUser);

// get user following
router.get("/following", verifyJWT, getUserFollowing);

// toggle follow user
router.post("/toggleFollow", verifyJWT, toggleFollowUser);

// get recommended users
router.get("/recommended", verifyJWT, getRecommendedUsers);

export default router;