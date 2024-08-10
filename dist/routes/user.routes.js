"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controllers_1 = require("../controllers/user.controllers");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// get all users
router.route("/").get(user_controllers_1.getAllUsers);
// get user by id or userName using query
router.route("/getUser").get(user_controllers_1.getUserByIdOrUserName);
// get user Details using the userName and userRole from query
router.route("/profile/details").get(user_controllers_1.getUserProfileDetails);
// save post to user's saved posts
router.route("/post/toggleSavePost").post(user_controllers_1.toggleSavePost);
/* --- SECURED ROUTES --- */
// get recommended users
router.route("/recommended").get(auth_middleware_1.verifyJWT, user_controllers_1.getRecommendedUsers);
// get authenticated dashboard user details via the access token
router.route("/authenticatedUser").get(auth_middleware_1.verifyJWT, user_controllers_1.getAuthenticatedUser);
// get user following
router.route("/following").get(auth_middleware_1.verifyJWT, user_controllers_1.getUserFollowing);
// toggle follow user
router.route("/toggleFollow").post(auth_middleware_1.verifyJWT, user_controllers_1.toggleFollowUser);
// toggle profile like
router.route("/toggleProfileLike").post(auth_middleware_1.verifyJWT, user_controllers_1.toggleProfileLike);
// update user by userId
router.route("/").patch(auth_middleware_1.verifyJWT, user_controllers_1.updateUser);
exports.default = router;
