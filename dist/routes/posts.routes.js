"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const posts_controllers_1 = require("../controllers/posts.controllers");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// get all posts
router.get("/", posts_controllers_1.getAllPosts);
// get post by ID
router.get("/:id", posts_controllers_1.getPostById);
// get posts of a user
router.get("/getPosts/user", posts_controllers_1.getPostsByUser);
//get user recommended posts
router.get("/user/recommendedPosts", auth_middleware_1.verifyJWT, posts_controllers_1.getRecommendedPosts);
// create a post
router.route("/").post(auth_middleware_1.verifyJWT, posts_controllers_1.createPost);
// toggle post like
router.route("/togglePostLike").post(auth_middleware_1.verifyJWT, posts_controllers_1.togglePostLike);
// create a post
router.route("/addComment").post(auth_middleware_1.verifyJWT, posts_controllers_1.addComment);
// delete post
router.delete("/:id", auth_middleware_1.verifyJWT, posts_controllers_1.deletePost);
exports.default = router;
