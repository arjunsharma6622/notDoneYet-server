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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.getRecommendedPosts = exports.getPostsByUser = exports.getPostById = exports.getAllPosts = void 0;
const post_model_1 = require("../models/post.model");
const user_model_1 = require("../models/user.model");
const getAllPosts = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield post_model_1.Post.find();
        res.status(200).json(posts);
    }
    catch (err) {
        console.error(`Error fetching posts: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getAllPosts = getAllPosts;
const getPostById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.id;
        const post = yield post_model_1.Post.findById(postId)
            .populate({
            path: "user",
            select: "name image bio followers following role userName",
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
});
exports.getPostById = getPostById;
const getPostsByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, userName } = req.query;
        if (!userId && !userName) {
            return res.status(400).json({ error: "User ID or User Name not provided" });
        }
        let user;
        if (userId) {
            user = yield user_model_1.User.findById(userId);
        }
        else if (userName) {
            user = yield user_model_1.User.findOne({ userName: userName });
        }
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const posts = yield post_model_1.Post.find({ user: user._id })
            .populate({ path: "user", select: "name image bio role followers userName" })
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
});
exports.getPostsByUser = getPostsByUser;
const getRecommendedPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        // Find the user and populate their following list with only the posts field
        const user = yield user_model_1.User.findById(userId)
            .populate({
            path: "following",
            select: "posts",
        })
            .lean();
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // Get the posts from the users that the current user is following
        const followingUserPosts = ((_a = user === null || user === void 0 ? void 0 : user.following) === null || _a === void 0 ? void 0 : _a.flatMap((f) => f.posts)) || [];
        // Find the recommended posts from the users that the current user is following
        const recommendedPosts = yield post_model_1.Post.find({
            _id: { $in: followingUserPosts },
        })
            .populate({
            path: "user",
            select: "name image bio role userName followers",
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
            .lean();
        // Find the remaining posts not in followingUserPosts
        const remainingPosts = yield post_model_1.Post.find({
            _id: { $nin: [...followingUserPosts] },
            user: { $ne: userId }
        })
            .populate({
            path: "user",
            select: "name image bio role userName followers",
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
            .lean();
        // Combine recommendedPosts and remainingPosts
        const allPosts = [...recommendedPosts, ...remainingPosts];
        // Paginate the combined results
        const paginatedPosts = allPosts.slice((page - 1) * limit, page * limit);
        // Format the posts to include the number of comments and likes
        const formattedPosts = paginatedPosts.map(post => {
            var _a, _b;
            return (Object.assign(Object.assign({}, post), { numComments: (_a = post.comments) === null || _a === void 0 ? void 0 : _a.length, numLikes: (_b = post.likes) === null || _b === void 0 ? void 0 : _b.length }));
        });
        res.status(200).json(formattedPosts);
    }
    catch (err) {
        console.error(`Error fetching posts: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getRecommendedPosts = getRecommendedPosts;
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.id;
        const post = yield post_model_1.Post.findByIdAndDelete(postId);
        res.status(200).json(post);
    }
    catch (err) {
        console.error(`Error deleting post: ${err}`);
        res.status(500).json({ message: err });
    }
});
exports.deletePost = deletePost;
