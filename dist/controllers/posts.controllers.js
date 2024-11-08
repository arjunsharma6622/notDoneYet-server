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
exports.deletePost = exports.addComment = exports.togglePostLike = exports.createPost = exports.getPostComments = exports.getRecommendedPosts = exports.getPostsOfAuthenticatedUser = exports.getPostsByUser = exports.getPostById = exports.getAllPosts = void 0;
const post_model_1 = require("../models/post.model");
const user_model_1 = require("../models/user.model");
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const venue_model_1 = require("../models/venue.model");
exports.getAllPosts = (0, asyncHandler_1.asyncHandler)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield post_model_1.Post.find();
    res.status(200).json(new ApiResponse_1.ApiResponse(200, posts, "Posts fetched successfully"));
}));
exports.getPostById = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.id;
    const post = yield post_model_1.Post.findById(postId)
        .populate({
        path: "user",
        select: "name image bio followers following role userName",
    })
        .populate({
        path: "comments",
        populate: { path: "user", select: "name image userName" },
    })
        .populate({ path: "likes", select: "name image _id userName" })
        .sort({ createdAt: -1 });
    if (!post)
        throw new ApiError_1.ApiError(404, "Post not found");
    res.status(200).json(new ApiResponse_1.ApiResponse(200, post, "Post fetched successfully"));
}));
exports.getPostsByUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, userName } = req.query;
    if (!userId && !userName)
        throw new ApiError_1.ApiError(400, "User ID or User Name not provided");
    let user;
    if (userId) {
        user = yield user_model_1.User.findById(userId);
        if (!user) {
            user = yield venue_model_1.Venue.findById(userId);
        }
    }
    else if (userName) {
        user = yield user_model_1.User.findOne({ userName: userName });
    }
    if (!user) {
        throw new ApiError_1.ApiError(404, "User not found");
    }
    const posts = yield post_model_1.Post.find({ user: user._id })
        .populate({ path: "user", select: "name image bio role followers userName" })
        .populate({
        path: "comments",
        populate: { path: "user", select: "name image userName" },
    })
        .populate({ path: "likes", select: "name image userName" })
        .sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, posts, "Posts fetched successfully"));
}));
/* --- SECURE CONTROLLERS --- */
exports.getPostsOfAuthenticatedUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    if (!userId) {
        return res.status(400).json({ error: "User ID or User Name not provided" });
    }
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new ApiError_1.ApiError(404, "User not found");
    }
    const posts = yield post_model_1.Post.find({ user: user._id })
        .populate({ path: "user", select: "name image bio role followers userName" })
        .populate({
        path: "comments",
        populate: { path: "user", select: "name image userName" },
    })
        .populate({ path: "likes", select: "name image userName" })
        .sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, posts, "Posts fetched successfully"));
}));
exports.getRecommendedPosts = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
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
    const followingUsersPosts = ((_b = user === null || user === void 0 ? void 0 : user.following) === null || _b === void 0 ? void 0 : _b.flatMap((f) => f.posts)) || [];
    // Find the recommended posts from the users that the current user is following
    const recommendedPosts = yield post_model_1.Post.find({
        _id: { $in: followingUsersPosts },
    })
        .populate({
        path: "user",
        select: "name image bio role userName followers",
    })
        // .populate({
        //     path: "comments",
        //     populate: {
        //         path: "user",
        //         select: "name image bio role _id userName",
        //     },
        // })
        .populate({ path: "likes", select: "name image _id userName" })
        .sort({ createdAt: -1 })
        .lean();
    // Find the remaining posts not in followingUserPosts
    const remainingPosts = yield post_model_1.Post.find({
        _id: { $nin: [...followingUsersPosts] },
        user: { $ne: userId }
    })
        .populate({
        path: "user",
        select: "name image bio role userName followers",
    })
        // .populate({
        //     path: "comments",
        //     populate: {
        //         path: "user",
        //         select: "name image bio role _id",
        //     },
        // })
        .populate({ path: "likes", select: "name image _id" })
        .sort({ createdAt: -1 })
        .lean();
    // Combine recommendedPosts and remainingPosts
    const allPosts = [...recommendedPosts, ...remainingPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    // Paginate the combined results
    const paginatedPosts = allPosts.slice((page - 1) * limit, page * limit);
    // Format the posts to include the number of comments and likes
    const formattedPosts = paginatedPosts.map(post => {
        var _a, _b;
        return (Object.assign(Object.assign({}, post), { numComments: (_a = post.comments) === null || _a === void 0 ? void 0 : _a.length, numLikes: (_b = post.likes) === null || _b === void 0 ? void 0 : _b.length }));
    });
    res.status(200).json(new ApiResponse_1.ApiResponse(200, formattedPosts, "Posts fetched successfully"));
}));
exports.getPostComments = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.id;
    // Find the post by ID and populate the comments
    const post = yield post_model_1.Post.findById(postId).populate({
        path: "comments",
        options: { sort: { createdAt: -1 } }, // Sorting by creation date in descending order (most recent first)
        populate: { path: "user", select: "name image bio _id role userName" },
    });
    if (!post)
        throw new ApiError_1.ApiError(404, "Post not found");
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, post.comments, "Comments fetched successfully"));
}));
exports.createPost = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const userId = req.user._id;
    const { description, images } = req.body;
    const newPost = new post_model_1.Post({
        user: userId,
        description,
        images
    });
    yield newPost.save();
    const user = yield user_model_1.User.findById(userId);
    if (!user)
        throw new ApiError_1.ApiError(404, "User not found");
    (_c = user === null || user === void 0 ? void 0 : user.posts) === null || _c === void 0 ? void 0 : _c.push(newPost._id);
    yield user.save();
    return res.status(201).json(new ApiResponse_1.ApiResponse(201, newPost, "Post created successfully"));
}));
exports.togglePostLike = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let message = "";
    const { postId } = req.body;
    const userId = req.user._id;
    const post = yield post_model_1.Post.findById(postId);
    if (!post)
        throw new ApiError_1.ApiError(404, "Post not found");
    const user = yield user_model_1.User.findById(userId);
    if (!user)
        throw new ApiError_1.ApiError(404, "User not found");
    if (post.likes.includes(userId)) {
        post.likes = post.likes.filter((like) => like.toString() != userId.toString());
        message = "Post unliked";
    }
    else {
        post.likes.push(userId);
        message = "Post liked";
    }
    yield post.save();
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, { updatedLikes: post.likes }, message));
}));
exports.addComment = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const { postId, commentText } = req.body;
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new ApiError_1.ApiError(404, "User not found");
    }
    const post = yield post_model_1.Post.findById(postId);
    if (!post) {
        throw new ApiError_1.ApiError(404, "Post not found");
    }
    // Create a new comment
    let newComment = new post_model_1.Comment({
        user: userId,
        post: postId,
        text: commentText,
    });
    // Save the new comment
    yield newComment.save();
    // Populate the user fields in the new comment
    newComment = yield newComment.populate({
        path: "user",
        select: "name image role _id bio",
    });
    // Add the new comment to the post's comments array
    post.comments.push(newComment._id);
    yield post.save();
    return res.status(201).json(new ApiResponse_1.ApiResponse(201, newComment, "Comment added successfully"));
}));
exports.deletePost = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.id;
    const post = yield post_model_1.Post.findByIdAndDelete(postId);
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, {}, "Post deleted successfully"));
}));
