import express from "express";
import {
  addMessageToConversation,
  createConversation,
  createNewConversation,
  getConversationById,
  getUnreadMessagesCount,
  getUnreadMessagesCountOfUser,
  getUserConversation,
  updateMessageSeen
} from "../controllers/conversation.controllers";
import { verifyJWT } from "../middleware/auth.middleware";

const router = express.Router();

// create a conversation
router.post("/", createConversation);

// create a new conversation
router.post("/create/new", createNewConversation)


/* --- SECURED ROUTES --- */

// get conversation by conversationId
router.get("/:id", verifyJWT, getConversationById);

// get all user conversations using userId
router.get("/user/getAllConversations", verifyJWT, getUserConversation);

// add messages via post
router.post("/addMessage/:id", verifyJWT, addMessageToConversation);

// update messages seen
router.put("/:id/seen", verifyJWT, updateMessageSeen);

// get total unread messages in a conversation
router.get("/:id/unread", verifyJWT, getUnreadMessagesCount);

// get the all the unread messages count of all conversations of a given userId
router.get("/unreadCount/user", verifyJWT, getUnreadMessagesCountOfUser)

export default router;