import express, { Request, Response } from "express";
import { Conversation } from "../models/conversation";
import { User } from "../models/user";

const router = express.Router();

// create a new conversation
router.post("/", async (req: Request, res: Response) => {
  try {
    const { senderId, recipientId, content } = req.body;

    // check if conversation already exists
    let conversation = await Conversation.findOne({
      users: { $all: [senderId, recipientId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        users: [senderId, recipientId],
        messages: [{ senderId: senderId, content }],
      });

      await conversation.save();
    }

    res.status(200).json(conversation);
  } catch (err) {
    console.error(`Error creating conversation: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// get all user conversations using userId
router.get("/user/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const conversations = await Conversation.find({
      users: { $in: [userId] },
    })
      .populate({
        path: "users",
        select: "name image bio",
      })
      .exec();
    // sort all the conversations by latest message timestamp
    conversations.sort((a:any, b:any) => {
      const aLastMsgTime = a.messages[a.messages.length - 1].createdAt;
      const bLastMsgTime = b.messages[b.messages.length - 1].createdAt;
      return bLastMsgTime - aLastMsgTime;
    });
    res.status(200).json(conversations);
  } catch (err) {
    console.error(`Error fetching conversations: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// get conversation by conversationId
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const conversationId = req.params.id;
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    res.status(200).json(conversation);
  } catch (err) {
    console.error(`Error fetching conversations: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// update messages seen
router.put("/:id/seen", async (req: Request, res: Response) => {
  try {
    const conversationId = req.params.id;
    const { currUserId } = req.body;

    const conversation = await Conversation.findById(conversationId);
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

    await conversation.save();
    return res.status(200).json(conversation);
  } catch (err) {
    console.error(`Error fetching conversations: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// get total unread messages in a conversation
router.get("/:id/unread", async (req: Request, res: Response) => {
  try {
    const conversationId = req.params.id;
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const unreadCount: any = { _id: "", count: 0 };

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
  } catch (err) {
    console.error(`Error fetching conversations: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// get the all the unread messages count of all conversations of a given userId
router.get("/unreadCount/user/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const conversations = await Conversation.find({
      users: { $in: [userId] },
    });
    let unreadCount = 0;

    for (let i=0; i<conversations.length; i++){
      let currConversationUnreadCount = 0;
      for (let j = conversations[i].messages.length - 1; j >= 0; j--) {
        if (conversations[i].messages[j].seen == true) {
          break;
        }

        if (conversations[i].messages[j].senderId?.toString() != userId) {
          currConversationUnreadCount = currConversationUnreadCount + 1;
        }
      }
      unreadCount += currConversationUnreadCount;
    }

    return res.status(200).json({unreadCount});
  } catch (err) {
    console.error(`Error fetching conversations: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
})

// add messages via post
router.post("/:id", async (req: Request, res: Response) => {
  try {
    const { senderId, content } = req.body;
    const conversationId = req.params.id;
    const userData = await User.findById(senderId);
    // Find the conversation by ID
    const conversation = await Conversation.findById(conversationId);
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
    await conversation.save();

    const updatedConversation: any = await Conversation.findById(
      conversationId
    ).populate({
      path: "users",
      select: "name image bio",
    });

    const recentMsg =
      updatedConversation.messages[updatedConversation.messages.length - 1];

    return res.status(200).json(recentMsg);
  } catch (err) {
    console.error(`Error fetching conversations: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;