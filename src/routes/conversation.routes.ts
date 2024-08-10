import express from "express";
import {
  addMessageToConversation,
  getConversationById,
  getUnreadMessagesCount,
  getUnreadMessagesCountOfUser,
  getUserConversation,
  updateMessageSeen
} from "../controllers/conversation.controllers";
import { verifyJWT } from "../middleware/auth.middleware";

const router = express.Router();

/* --- SECURED ROUTES --- */

// get conversation by conversationId
router.get("/:id", verifyJWT, getConversationById);

// get total unread messages in a conversation
router.get("/:id/unread", verifyJWT, getUnreadMessagesCount);

// get the all the unread messages count of all conversations of a given userId
router.get("/unreadCount/user", verifyJWT, getUnreadMessagesCountOfUser)

// get all user conversations using userId
router.get("/user/getAllConversations", verifyJWT, getUserConversation);

// add messages via post
router.post("/addMessage/:id", verifyJWT, addMessageToConversation);

// update messages seen
router.patch("/:id/seen", verifyJWT, updateMessageSeen);

export default router;