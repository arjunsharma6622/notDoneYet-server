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
exports.updateUser = exports.getRecommendedUsers = exports.toggleProfileLike = exports.toggleFollowUser = exports.getUserFollowing = exports.getAuthenticatedUser = exports.toggleSavePost = exports.getUserProfileDetails = exports.getUserByIdOrUserName = exports.getAllUsers = void 0;
const conversation_model_1 = require("../models/conversation.model");
const user_model_1 = require("../models/user.model");
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const ApiError_1 = require("../utils/ApiError");
exports.getAllUsers = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roles } = req.query;
    if (roles) {
        const rolesArray = roles.toString().trim().split(',');
        const users = yield user_model_1.User.find({ role: { $in: rolesArray } });
        if (!users)
            throw new ApiError_1.ApiError(404, "No users found");
        return res.status(200).json(new ApiResponse_1.ApiResponse(200, { users }, "Users fetched successfully"));
    }
    const users = yield user_model_1.User.find();
    if (!users)
        throw new ApiError_1.ApiError(404, "No users found");
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, { users }, "Users fetched successfully"));
}));
const getUserByIdOrUserName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, userName } = req.query;
        if (!userId && !userName) {
            return res.status(404).json({ error: "User not found" });
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
        res.status(200).json(user);
    }
    catch (err) {
        console.error(`Error fetching users: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getUserByIdOrUserName = getUserByIdOrUserName;
const getUserProfileDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { role, userName } = req.query;
        if (!role || !userName) {
            return res.status(404).json({ error: "User not found" });
        }
        const user = yield user_model_1.User.findOne({ role, userName });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    }
    catch (err) {
        console.error(`Error fetching users: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getUserProfileDetails = getUserProfileDetails;
const toggleSavePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, postId } = req.body;
        let message = '';
        const user = yield user_model_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // check if post is already saved
        if (user.savedPosts.includes(postId)) {
            const finalPosts = user.savedPosts.filter((id) => id.toString() !== postId);
            user.savedPosts = finalPosts;
            message = 'Post removed from saved posts';
        }
        else {
            user.savedPosts.push(postId);
            message = 'Post added to saved posts';
        }
        yield user.save();
        res.status(200).json({ message });
    }
    catch (err) {
        console.error(`Error updating user: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.toggleSavePost = toggleSavePost;
/* --- SECURE CONTROLLERS --- */
exports.getAuthenticatedUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(req.user._id).select("-password -refreshToken");
    if (!user)
        throw new ApiError_1.ApiError(404, "User not found");
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, user, "User fetched successfully"));
}));
exports.getUserFollowing = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = req.user._id;
    const user = yield user_model_1.User.findById(userId).populate("following");
    if (!user)
        throw new ApiError_1.ApiError(404, "User not found");
    const userConversations = user.conversations;
    const updatedUserFollowings = (_a = user === null || user === void 0 ? void 0 : user.following) === null || _a === void 0 ? void 0 : _a.map((following) => {
        const followingConversations = following.conversations;
        // Find the common conversationId
        const commonConversationId = followingConversations.find((conversationId) => userConversations === null || userConversations === void 0 ? void 0 : userConversations.includes(conversationId));
        return Object.assign(Object.assign({}, following.toObject()), { conversationId: commonConversationId });
    });
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, { userFollowings: updatedUserFollowings }, "User followings fetched successfully"));
}));
exports.toggleFollowUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { selectedUserId } = req.body;
    let messageToSend = "";
    const currentUserId = req.user._id;
    const currentUser = yield user_model_1.User.findById(currentUserId);
    const selectedUser = yield user_model_1.User.findById(selectedUserId);
    if (!currentUser || !selectedUser)
        throw new ApiError_1.ApiError(404, "User not found");
    // check if current user is following the selected user
    if (currentUser.following.includes(selectedUserId)) {
        // unfollow
        messageToSend = "User unfollowed";
        currentUser.following.pull(selectedUserId);
        selectedUser.followers.pull(currentUserId);
    }
    else {
        // follow
        messageToSend = "User followed";
        currentUser.following.push(selectedUserId);
        selectedUser.followers.push(currentUserId);
    }
    // first check if a conversation exists between the two users
    let checkConversation = yield conversation_model_1.Conversation.findOne({ users: { $all: [currentUserId, selectedUserId] } });
    let convoId = checkConversation ? checkConversation._id : null;
    if (!checkConversation) {
        // create a conversation of the two users and push that conversation id into the users conversations array
        const conversation = new conversation_model_1.Conversation({ users: [currentUserId, selectedUserId] });
        yield conversation.save();
        convoId = conversation._id;
        currentUser.conversations.push(conversation._id);
        selectedUser.conversations.push(conversation._id);
    }
    yield currentUser.save();
    yield selectedUser.save();
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, { conversationId: convoId }, messageToSend));
}));
exports.toggleProfileLike = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { profileId } = req.body;
    const userId = req.user._id;
    // Fetch the profile and user from the database
    const profile = yield user_model_1.User.findById(profileId);
    if (!profile)
        throw new ApiError_1.ApiError(404, "Profile not found");
    const user = yield user_model_1.User.findById(userId);
    if (!user)
        throw new ApiError_1.ApiError(404, "User not found");
    let messageToSend = "";
    // Check if the profile is already liked by the user
    const isLiked = user.likedProfiles.includes(profileId);
    if (isLiked) {
        // If already liked, then unlike
        user.likedProfiles = user.likedProfiles.filter((id) => id.toString() !== profileId.toString());
        profile.profileLikes = profile.profileLikes.filter((id) => id.toString() !== userId.toString());
        messageToSend = "Profile unliked";
    }
    else {
        // If not liked, then like
        user.likedProfiles.push(profileId);
        profile.profileLikes.push(userId);
        messageToSend = "Profile liked";
    }
    // Save the changes to the user and profile
    yield user.save();
    yield profile.save();
    const val = messageToSend === "Profile liked" ? 1 : -1;
    // Return a success response
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, { liked: val }, messageToSend));
}));
exports.getRecommendedUsers = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const user = yield user_model_1.User.findById(userId).populate("following");
    if (!user)
        throw new ApiError_1.ApiError(404, "User not found");
    const userFollowings = user.following;
    userFollowings.push(userId);
    const recommendedUsers = yield user_model_1.User.find({
        _id: { $nin: userFollowings }, role: { $nin: ["admin", "venue"] }
    });
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, { recommendedUsers }, "Recommended users fetched successfully"));
}));
exports.updateUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const updates = req.body;
    // console.log(updates);
    const user = yield user_model_1.User.findByIdAndUpdate(userId, updates, { new: true });
    if (!user) {
        throw new ApiError_1.ApiError(404, "User not found");
    }
    res.status(200).json(new ApiResponse_1.ApiResponse(200, user, "User updated successfully"));
}));
