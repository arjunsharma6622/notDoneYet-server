"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const conversation_controllers_1 = require("../controllers/conversation.controllers");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// create a conversation
router.post("/", conversation_controllers_1.createConversation);
// create a new conversation
router.post("/create/new", conversation_controllers_1.createNewConversation);
/* --- SECURED ROUTES --- */
// get conversation by conversationId
router.get("/:id", auth_middleware_1.verifyJWT, conversation_controllers_1.getConversationById);
// get total unread messages in a conversation
router.get("/:id/unread", auth_middleware_1.verifyJWT, conversation_controllers_1.getUnreadMessagesCount);
// get the all the unread messages count of all conversations of a given userId
router.get("/unreadCount/user", auth_middleware_1.verifyJWT, conversation_controllers_1.getUnreadMessagesCountOfUser);
// get all user conversations using userId
router.get("/user/getAllConversations", auth_middleware_1.verifyJWT, conversation_controllers_1.getUserConversation);
// add messages via post
router.post("/addMessage/:id", auth_middleware_1.verifyJWT, conversation_controllers_1.addMessageToConversation);
// update messages seen
router.patch("/:id/seen", auth_middleware_1.verifyJWT, conversation_controllers_1.updateMessageSeen);
exports.default = router;
