import { Request, Response } from "express";
import { Conversation } from "../models/conversation.model";
import { User } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

export const createConversation = async (req: Request, res: Response) => {
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
}

export const createNewConversation = async (req: Request, res: Response) => {
    try {
        const { senderId, recipientId, content }: any = req.body;

        // check if sender exists
        const sender = await User.findById(senderId);
        if (!sender) {
            return res.status(404).json({ error: "Sender not found" });
        }

        // check if recipient exists
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ error: "Recipient not found" });
        }

        // check if a conversation already exists with these two users
        let conversation: any = await Conversation.findOne({
            users: { $all: [senderId, recipientId] },
        });
        if (conversation) {
            conversation.messages.push({ senderId: senderId, content: content, createdAt: new Date(), seen: false });
            await conversation.save();
            const updatedConversation: any = await Conversation.findById(
                conversation._id
            ).populate({
                path: "users",
                select: "name image bio",
            });
            const recentMsg =
                updatedConversation.messages[updatedConversation.messages.length - 1];
            return res.status(200).json(recentMsg);
        }

        // create a new conversation
        const newConversation = new Conversation({
            users: [senderId, recipientId],
            messages: [{ senderId: senderId, content, createdAt: new Date(), seen: false }],
        });
        const savedConversation: any = await newConversation.save();

        // push the conversation ID to both sender and recipient
        sender?.conversations?.push(savedConversation?._id);
        recipient?.conversations?.push(savedConversation?._id);
        await sender.save();
        await recipient.save();

        const updatedConversation: any = await Conversation.findById(
            savedConversation._id
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


}

/* --- SECURE CONTROLLERS --- */

// get conversation by ID
export const getConversationById = asyncHandler(async (req: any, res: Response) => {
    const userId = req.user._id;
    const conversationId = req.params.id;
    const conversation = await Conversation.findOne({
        $and: [
            { _id: conversationId },
            { users: { $in: [userId] } }
        ]
    }).populate({
        path: "users",
        select: "name image bio",
    });

    if (!conversation) throw new ApiError(404, "Conversation not found");

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            conversation,
            "Conversation fetched successfully"
        ));
})

// get all conversations of a user
export const getUserConversation = asyncHandler(async (req: any, res: Response) => {
    const userId = req.user._id;
    const conversations = await Conversation.find({
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
            .json(new ApiResponse(200, conversations, "Conversations fetched successfully"))

    // sort all the conversations by latest message timestamp
    conversations.sort((a: any, b: any) => {
        const aLastMsgTime = a.messages.length > 0 ? new Date(a.messages[a.messages.length - 1].createdAt).getTime() : new Date(a.createdAt).getTime();
        const bLastMsgTime = b.messages.length > 0 ? new Date(b.messages[b.messages.length - 1].createdAt).getTime() : new Date(b.createdAt).getTime();
        return bLastMsgTime - aLastMsgTime;
    });

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            conversations,
            "Conversations fetched successfully"
        ))
})

// add message to a conversation
export const addMessageToConversation = asyncHandler(async (req: any, res: Response) => {
    const senderId = req.user._id;
    const { content } = req.body;
    const conversationId = req.params.id;

    // Find the conversation by ID
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) throw new ApiError(404, "Conversation not found");

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

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            recentMsg,
            "Message added to conversation successfully"
        ));
})

// update the message seen
export const updateMessageSeen = asyncHandler(async (req: any, res: Response) => {
    try {
        const conversationId = req.params.id;
        const currUserId = req.user._id;
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
})

// get total unread messages of a conversation
export const getUnreadMessagesCount = asyncHandler(async (req: Request, res: Response) => {
    const conversationId = req.params.id;
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new ApiError(404, "Conversation not found");

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
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            unreadCount,
            "Unread messages count fetched successfully"
        ));
})

// get total unread messages of user
export const getUnreadMessagesCountOfUser = asyncHandler(async (req: any, res: Response) => {
    const userId = req?.user?._id;
    const conversations = await Conversation.find({
        users: { $in: [userId] },
    });
    let unreadCount = 0;

    for (let i = 0; i < conversations.length; i++) {
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
    return res
    .status(200)
    .json(new ApiResponse(
        200, 
        {unreadCount}, 
        "Unread messages count fetched successfully"
    ));
})