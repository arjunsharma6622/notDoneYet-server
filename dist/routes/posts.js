"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const post_1 = require("../models/post");
const user_1 = require("../models/user");
const router = express_1.default.Router();
// get all posts
router.get("/", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield post_1.Post.find();
        res.status(200).json(posts);
    }
    catch (err) {
        console.error(`Error fetching posts: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// get post by ID
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.id;
        const post = yield post_1.Post.findById(postId)
            .populate({
            path: "user",
            select: "name image bio followers following role",
        })
            .populate({
            path: "comments",
            populate: { path: "user", select: "name image" },
        })
            .populate({ path: "likes", select: "name image _id" })
            .sort({ createdAt: -1 });
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        res.status(200).json(post);
    }
    catch (err) {
        console.error(`Error fetching posts: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// get user posts by userId
router.get("/user/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const posts = yield post_1.Post.find({ user: userId })
            .populate({ path: "user", select: "name image bio role" })
            .populate({
            path: "comments",
            populate: { path: "user", select: "name image" },
        })
            .populate({ path: "likes", select: "name image" })
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    }
    catch (err) {
        console.error(`Error fetching posts: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
//get user recommended posts
router.get("/recommended/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = req.params.id;
    const page = 1;
    const limit = 10;
    try {
        // Find the user and populate their following list with only the posts field
        const user = yield user_1.User.findById(userId)
            .populate({
            path: "following",
            select: "posts",
        })
            .lean();
        // Get the posts from the users that the current user is following
        const followingUserPosts = (_a = user === null || user === void 0 ? void 0 : user.following) === null || _a === void 0 ? void 0 : _a.flatMap((f) => f.posts);
        // Find the recommended posts and populate the user and comments fields
        const recommendedPosts = yield post_1.Post.find({
            _id: { $in: followingUserPosts },
            createdAt: { $gte: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000) },
        })
            .populate({
            path: "user",
            select: "name image bio role",
        })
            .populate({
            path: "comments",
            populate: {
                path: "user",
                select: "name image bio role _id",
            },
        })
            .populate({ path: "likes", select: "name image _id" })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();
        // Format the recommended posts to include the number of comments and likes
        const formattedRecommendedPosts = recommendedPosts.map((post) => (Object.assign(Object.assign({}, post), { numComments: post.comments.length, numLikes: post.likes.length })));
        res.status(200).json(recommendedPosts);
    }
    catch (err) {
        console.error(`Error fetching posts: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
exports.default = router;
