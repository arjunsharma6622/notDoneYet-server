"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controllers_1 = require("../controllers/user.controllers");
const router = express_1.default.Router();
// get all users
router.get("/", user_controllers_1.getAllUsers);
// get user by id or userName using query
router.get("/getUser", user_controllers_1.getUserByIdOrUserName);
// get user following
router.get("/following/:id", user_controllers_1.getUserFollowing);
// get user Details using the userName and userRole from query
router.get("/profile/details", user_controllers_1.getUserProfileDetails);
// get recommended users
router.get("/recommended/:id", user_controllers_1.getRecommendedUsers);
// update user by userId
router.patch("/:id");
// save post to user's saved posts
router.post("/post/toggleSavePost", user_controllers_1.toggleSavePost);
// toggle follow user
router.post("/toggleFollow");
exports.default = router;
