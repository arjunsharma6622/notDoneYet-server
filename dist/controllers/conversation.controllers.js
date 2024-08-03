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
exports.addMessageToConversation = exports.getUnreadMessagesCountOfUser = exports.getUnreadMessagesCount = exports.updateMessageSeen = exports.getConversationById = exports.getUserConversation = exports.createNewConversation = exports.createConversation = void 0;
const conversation_model_1 = require("../models/conversation.model");
const user_model_1 = require("../models/user.model");
const createConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { senderId, recipientId, content } = req.body;
        // check if conversation already exists
        let conversation = yield conversation_model_1.Conversation.findOne({
            users: { $all: [senderId, recipientId] },
        });
        if (!conversation) {
            conversation = new conversation_model_1.Conversation({
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
});
exports.createConversation = createConversation;
const createNewConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { senderId, recipientId, content } = req.body;
        // check if sender exists
        const sender = yield user_model_1.User.findById(senderId);
        if (!sender) {
            return res.status(404).json({ error: "Sender not found" });
        }
        // check if recipient exists
        const recipient = yield user_model_1.User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ error: "Recipient not found" });
        }
        // check if a conversation already exists with these two users
        let conversation = yield conversation_model_1.Conversation.findOne({
            users: { $all: [senderId, recipientId] },
        });
        if (conversation) {
            conversation.messages.push({ senderId: senderId, content: content, createdAt: new Date(), seen: false });
            yield conversation.save();
            const updatedConversation = yield conversation_model_1.Conversation.findById(conversation._id).populate({
                path: "users",
                select: "name image bio",
            });
            const recentMsg = updatedConversation.messages[updatedConversation.messages.length - 1];
            return res.status(200).json(recentMsg);
        }
        // create a new conversation
        const newConversation = new conversation_model_1.Conversation({
            users: [senderId, recipientId],
            messages: [{ senderId: senderId, content, createdAt: new Date(), seen: false }],
        });
        const savedConversation = yield newConversation.save();
        // push the conversation ID to both sender and recipient
        (_a = sender === null || sender === void 0 ? void 0 : sender.conversations) === null || _a === void 0 ? void 0 : _a.push(savedConversation === null || savedConversation === void 0 ? void 0 : savedConversation._id);
        (_b = recipient === null || recipient === void 0 ? void 0 : recipient.conversations) === null || _b === void 0 ? void 0 : _b.push(savedConversation === null || savedConversation === void 0 ? void 0 : savedConversation._id);
        yield sender.save();
        yield recipient.save();
        const updatedConversation = yield conversation_model_1.Conversation.findById(savedConversation._id).populate({
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
});
exports.createNewConversation = createNewConversation;
const getUserConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const conversations = yield conversation_model_1.Conversation.find({
            users: { $in: [userId] },
        })
            .populate({
            path: "users",
            select: "name image bio",
        })
            .exec();
        // if there are no messages then return empty array
        if (conversations.length == 1) {
            return res.status(200).json(conversations);
        }
        // sort all the conversations by latest message timestamp
        conversations.sort((a, b) => {
            const aLastMsgTime = a.messages.length > 0 ? new Date(a.messages[a.messages.length - 1].createdAt).getTime() : new Date(a.createdAt).getTime();
            const bLastMsgTime = b.messages.length > 0 ? new Date(b.messages[b.messages.length - 1].createdAt).getTime() : new Date(b.createdAt).getTime();
            return bLastMsgTime - aLastMsgTime;
        });
        res.status(200).json(conversations);
    }
    catch (err) {
        console.error(`Error fetching conversations: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getUserConversation = getUserConversation;
const getConversationById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conversationId = req.params.id;
        const conversation = yield conversation_model_1.Conversation.findById(conversationId).populate({
            path: "users",
            select: "name image bio",
        });
        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }
        res.status(200).json(conversation);
    }
    catch (err) {
        console.error(`Error fetching conversations: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getConversationById = getConversationById;
const updateMessageSeen = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conversationId = req.params.id;
        const { currUserId } = req.body;
        const conversation = yield conversation_model_1.Conversation.findById(conversationId);
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
});
exports.updateMessageSeen = updateMessageSeen;
const getUnreadMessagesCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conversationId = req.params.id;
        const conversation = yield conversation_model_1.Conversation.findById(conversationId);
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
});
exports.getUnreadMessagesCount = getUnreadMessagesCount;
const getUnreadMessagesCountOfUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const userId = req.params.id;
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
                if (((_c = conversations[i].messages[j].senderId) === null || _c === void 0 ? void 0 : _c.toString()) != userId) {
                    currConversationUnreadCount = currConversationUnreadCount + 1;
                }
            }
            unreadCount += currConversationUnreadCount;
        }
        return res.status(200).json({ unreadCount });
    }
    catch (err) {
        console.error(`Error fetching conversations: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getUnreadMessagesCountOfUser = getUnreadMessagesCountOfUser;
const addMessageToConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { senderId, content } = req.body;
        const conversationId = req.params.id;
        const userData = yield user_model_1.User.findById(senderId);
        // Find the conversation by ID
        const conversation = yield conversation_model_1.Conversation.findById(conversationId);
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
        const updatedConversation = yield conversation_model_1.Conversation.findById(conversationId).populate({
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
});
exports.addMessageToConversation = addMessageToConversation;
