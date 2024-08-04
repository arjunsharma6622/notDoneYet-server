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
router.get("/", user_controllers_1.getAllUsers);
// get user by id or userName using query
router.get("/getUser", user_controllers_1.getUserByIdOrUserName);
// get user Details using the userName and userRole from query
router.get("/profile/details", user_controllers_1.getUserProfileDetails);
// update user by userId
router.patch("/:id");
// save post to user's saved posts
router.post("/post/toggleSavePost", user_controllers_1.toggleSavePost);
/* --- SECURED ROUTES --- */
// get authenticated dashboard user details via the access token
router.get('/authenticatedUser', auth_middleware_1.verifyJWT, user_controllers_1.getAuthenticatedUser);
// get user following
router.get("/following", auth_middleware_1.verifyJWT, user_controllers_1.getUserFollowing);
// toggle follow user
router.post("/toggleFollow", auth_middleware_1.verifyJWT, user_controllers_1.toggleFollowUser);
// get recommended users
router.get("/recommended", auth_middleware_1.verifyJWT, user_controllers_1.getRecommendedUsers);
exports.default = router;
