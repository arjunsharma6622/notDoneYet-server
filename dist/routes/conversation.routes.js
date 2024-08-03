"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const conversation_controllers_1 = require("../controllers/conversation.controllers");
const router = express_1.default.Router();
// create a conversation
router.post("/", conversation_controllers_1.createConversation);
// create a new conversation
router.post("/create/new", conversation_controllers_1.createNewConversation);
// get all user conversations using userId
router.get("/user/:id", conversation_controllers_1.getUserConversation);
// get conversation by conversationId
router.get("/:id", conversation_controllers_1.getConversationById);
// update messages seen
router.put("/:id/seen", conversation_controllers_1.updateMessageSeen);
// get total unread messages in a conversation
router.get("/:id/unread", conversation_controllers_1.getUnreadMessagesCount);
// get the all the unread messages count of all conversations of a given userId
router.get("/unreadCount/user/:id", conversation_controllers_1.getUnreadMessagesCountOfUser);
// add messages via post
router.post("/:id", conversation_controllers_1.addMessageToConversation);
exports.default = router;
