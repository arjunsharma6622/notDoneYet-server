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
exports.getUnreadMessagesCountOfUser = exports.getUnreadMessagesCount = exports.updateMessageSeen = exports.addMessageToConversation = exports.getUserConversation = exports.getConversationById = void 0;
const conversation_model_1 = require("../models/conversation.model");
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
/* --- SECURE CONTROLLERS --- */
// get conversation by ID
exports.getConversationById = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const conversationId = req.params.id;
    const conversation = yield conversation_model_1.Conversation.findOne({
        $and: [
            { _id: conversationId },
            { users: { $in: [userId] } }
        ]
    }).populate({
        path: "users",
        select: "name image bio",
    });
    if (!conversation)
        throw new ApiError_1.ApiError(404, "Conversation not found");
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, conversation, "Conversation fetched successfully"));
}));
// get all conversations of a user
exports.getUserConversation = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const conversations = yield conversation_model_1.Conversation.find({
        users: { $in: [userId] },
    })
        .populate({
        path: "users",
        select: "name image bio",
    })
        .exec();
    // if there are no messages then return empty array
    if (conversations.length == 1)
        return res
            .status(200)
            .json(new ApiResponse_1.ApiResponse(200, conversations, "Conversations fetched successfully"));
    // sort all the conversations by latest message timestamp
    conversations.sort((a, b) => {
        const aLastMsgTime = a.messages.length > 0 ? new Date(a.messages[a.messages.length - 1].createdAt).getTime() : new Date(a.createdAt).getTime();
        const bLastMsgTime = b.messages.length > 0 ? new Date(b.messages[b.messages.length - 1].createdAt).getTime() : new Date(b.createdAt).getTime();
        return bLastMsgTime - aLastMsgTime;
    });
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, conversations, "Conversations fetched successfully"));
}));
// add message to a conversation
exports.addMessageToConversation = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const senderId = req.user._id;
    const { content } = req.body;
    const conversationId = req.params.id;
    // Find the conversation by ID
    const conversation = yield conversation_model_1.Conversation.findById(conversationId);
    if (!conversation)
        throw new ApiError_1.ApiError(404, "Conversation not found");
    // Create a new message object
    const newMessage = {
        senderId: senderId,
        content: content,
        createdAt: new Date(),
        seen: false,
    };
    // Add the message to the conversation's messages array
    conversation.messages.push(newMessage);
    yield conversation.save();
    const updatedConversation = yield conversation_model_1.Conversation.findById(conversationId).populate({
        path: "users",
        select: "name image bio",
    });
    const recentMsg = updatedConversation.messages[updatedConversation.messages.length - 1];
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, recentMsg, "Message added to conversation successfully"));
}));
// update the message seen
exports.updateMessageSeen = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const conversationId = req.params.id;
    const currUserId = req.user._id;
    const conversation = yield conversation_model_1.Conversation.findById(conversationId);
    if (!conversation)
        throw new ApiError_1.ApiError(404, "Conversation not found");
    for (let i = conversation.messages.length - 1; i >= 0; i--) {
        if (conversation.messages[i].seen == true) {
            break;
        }
        //BUG_RESOLVED: here if you compare the objectId directly the === and == will check it by refrence, and two objects refs are different, so compare the toString()
        if (((_a = conversation.messages[i].senderId) === null || _a === void 0 ? void 0 : _a.toString()) === currUserId.toString()) {
        }
        else {
            conversation.messages[i].seen = true;
        }
    }
    yield conversation.save();
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, conversation, "Message seen successfully"));
}));
// get total unread messages of a conversation
exports.getUnreadMessagesCount = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const currUserId = req.user._id;
    const conversationId = req.params.id;
    const conversation = yield conversation_model_1.Conversation.findById(conversationId);
    if (!conversation)
        throw new ApiError_1.ApiError(404, "Conversation not found");
    const unreadCount = { _id: "", count: 0 };
    for (let i = conversation.messages.length - 1; i >= 0; i--) {
        if (conversation.messages[i].seen == true) {
            break;
        }
        if (((_b = conversation.messages[i].senderId) === null || _b === void 0 ? void 0 : _b.toString()) !== currUserId.toString()) {
            unreadCount._id = conversation.messages[i].senderId;
            unreadCount.count = unreadCount.count + 1;
        }
    }
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, unreadCount, "Unread messages count fetched successfully"));
}));
// get total unread messages of user
exports.getUnreadMessagesCountOfUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const userId = (_c = req === null || req === void 0 ? void 0 : req.user) === null || _c === void 0 ? void 0 : _c._id;
    const conversations = yield conversation_model_1.Conversation.find({
        users: { $in: [userId] },
    });
    let unreadCount = 0;
    for (let i = 0; i < conversations.length; i++) {
        let currConversationUnreadCount = 0;
        for (let j = conversations[i].messages.length - 1; j >= 0; j--) {
            if (conversations[i].messages[j].seen == true) {
                break;
            }
            if (((_d = conversations[i].messages[j].senderId) === null || _d === void 0 ? void 0 : _d.toString()) != userId) {
                currConversationUnreadCount = currConversationUnreadCount + 1;
            }
        }
        unreadCount += currConversationUnreadCount;
    }
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, { unreadCount }, "Unread messages count fetched successfully"));
}));
