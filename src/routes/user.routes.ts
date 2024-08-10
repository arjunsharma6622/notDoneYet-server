import express from "express";
import {
  getAllUsers,
  getAuthenticatedUser,
  getRecommendedUsers,
  getUserByIdOrUserName,
  getUserFollowing,
  getUserProfileDetails,
  toggleFollowUser,
  toggleProfileLike,
  toggleSavePost,
  updateUser,
} from "../controllers/user.controllers";
import { verifyJWT } from "../middleware/auth.middleware";

const router = express.Router();

// get all users
router.route("/").get(getAllUsers);

// get user by id or userName using query
router.route("/getUser").get(getUserByIdOrUserName);

// get user Details using the userName and userRole from query
router.route("/profile/details").get(getUserProfileDetails);

// save post to user's saved posts
router.route("/post/toggleSavePost").post(toggleSavePost);

/* --- SECURED ROUTES --- */

// get recommended users
router.route("/recommended").get(verifyJWT, getRecommendedUsers);

// get authenticated dashboard user details via the access token
router.route("/authenticatedUser").get(verifyJWT, getAuthenticatedUser);

// get user following
router.route("/following").get(verifyJWT, getUserFollowing);

// toggle follow user
router.route("/toggleFollow").post(verifyJWT, toggleFollowUser);

// toggle profile like
router.route("/toggleProfileLike").post(verifyJWT, toggleProfileLike);

// update user by userId
router.route("/").patch(verifyJWT, updateUser);

export default router;