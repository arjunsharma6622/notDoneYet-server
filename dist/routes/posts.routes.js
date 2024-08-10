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
router.route("/").get(posts_controllers_1.getAllPosts);
// create a post
router.route("/").post(auth_middleware_1.verifyJWT, posts_controllers_1.createPost);
// get post by ID
router.route("/:id").get(posts_controllers_1.getPostById);
// delete post by ID
router.route("/:id").delete(auth_middleware_1.verifyJWT, posts_controllers_1.deletePost);
// get posts of a user
router.route("/getPosts/user").get(posts_controllers_1.getPostsByUser);
// get posts of the authenticated user
router.route("/getPosts/authenticated").get(auth_middleware_1.verifyJWT, posts_controllers_1.getPostsOfAuthenticatedUser);
// get user recommended posts
router.route("/user/recommendedPosts").get(auth_middleware_1.verifyJWT, posts_controllers_1.getRecommendedPosts);
// toggle post like
router.route("/togglePostLike").post(auth_middleware_1.verifyJWT, posts_controllers_1.togglePostLike);
// add comment
router.route("/addComment").post(auth_middleware_1.verifyJWT, posts_controllers_1.addComment);
exports.default = router;
