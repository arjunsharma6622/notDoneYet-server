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
const conversation_1 = require("../models/conversation");
const user_1 = require("../models/user");
const router = express_1.default.Router();
// create a new conversation
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { senderId, recipientId, content } = req.body;
        // check if conversation already exists
        let conversation = yield conversation_1.Conversation.findOne({
            users: { $all: [senderId, recipientId] },
        });
        if (!conversation) {
            conversation = new conversation_1.Conversation({
                users: [senderId, recipientId],
                messages: [{ senderId: senderId, content }],
            });
            yield conversation.save();
        }
        res.status(200).json(conversation);
    }
    catch (err) {
        console.error(`Error creating conversation: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// get all user conversations using userId
router.get("/user/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const conversations = yield conversation_1.Conversation.find({
            users: { $in: [userId] },
        })
            .populate({
            path: "users",
            select: "name image bio",
        })
            .exec();
        res.status(200).json(conversations);
    }
    catch (err) {
        console.error(`Error fetching conversations: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// get conversation by conversationId
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conversationId = req.params.id;
        const conversation = yield conversation_1.Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }
        res.status(200).json(conversation);
    }
    catch (err) {
        console.error(`Error fetching conversations: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// update messages seen
router.put("/:id/seen", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conversationId = req.params.id;
        const { currUserId } = req.body;
        const conversation = yield conversation_1.Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }
        for (let i = conversation.messages.length - 1; i >= 0; i--) {
            if (conversation.messages[i].seen == true) {
                break;
            }
            if (conversation.messages[i].senderId != currUserId) {
                conversation.messages[i].seen = true;
            }
        }
        yield conversation.save();
        return res.status(200).json(conversation);
    }
    catch (err) {
        console.error(`Error fetching conversations: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// get total unread messages in a conversation
router.get("/:id/unread", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conversationId = req.params.id;
        const conversation = yield conversation_1.Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }
        const unreadCount = { _id: "", count: 0 };
        for (let i = conversation.messages.length - 1; i >= 0; i--) {
            if (conversation.messages[i].seen == true) {
                break;
            }
            if (conversation.messages[i].senderId != conversation.users[0]) {
                unreadCount._id = conversation.messages[i].senderId;
                unreadCount.count = unreadCount.count + 1;
            }
        }
        return res.status(200).json(unreadCount);
    }
    catch (err) {
        console.error(`Error fetching conversations: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// add messages via post
router.post("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { senderId, content } = req.body;
        const conversationId = req.params.id;
        const userData = yield user_1.User.findById(senderId);
        // Find the conversation by ID
        const conversation = yield conversation_1.Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }
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
        const updatedConversation = yield conversation_1.Conversation.findById(conversationId).populate({
            path: "users",
            select: "name image bio",
        });
        const recentMsg = updatedConversation.messages[updatedConversation.messages.length - 1];
        return res.status(200).json(recentMsg);
    }
    catch (err) {
        console.error(`Error fetching conversations: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
exports.default = router;
