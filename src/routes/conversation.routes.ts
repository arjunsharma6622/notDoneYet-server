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

const router = express.Router();

// create a conversation
router.post("/", createConversation);

// create a new conversation
router.post("/create/new", createNewConversation)

// get all user conversations using userId
router.get("/user/:id", getUserConversation);

// get conversation by conversationId
router.get("/:id", getConversationById);

// update messages seen
router.put("/:id/seen", updateMessageSeen);

// get total unread messages in a conversation
router.get("/:id/unread", getUnreadMessagesCount);

// get the all the unread messages count of all conversations of a given userId
router.get("/unreadCount/user/:id", getUnreadMessagesCountOfUser)

// add messages via post
router.post("/:id", addMessageToConversation);

export default router;