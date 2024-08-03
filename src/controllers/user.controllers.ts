import { Request, Response } from "express";
import { User } from "../models/user.model";
import { Conversation } from "../models/conversation.model";

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const { roles } = req.query;
        if (roles) {
            const rolesArray = roles.toString().trim().split(',');
            const users = await User.find({ role: { $in: rolesArray } });
            return res.status(200).json(users);
        }
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        console.error(`Error fetching users: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getUserByIdOrUserName = async (req: Request, res: Response) => {
    try {
        const { userId, userName } = req.query;
        if (!userId && !userName) {
            return res.status(404).json({ error: "User not found" });
        }
        let user;
        if (userId) {
            user = await User.findById(userId);
        } else if (userName) {
            user = await User.findOne({ userName: userName });
        }
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (err) {
        console.error(`Error fetching users: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getUserFollowing = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).populate("following");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const userConversations = user.conversations;

        const updatedUserFollowings = user?.following?.map((following: any) => {
            const followingConversations = following.conversations;
            // Find the common conversationId
            const commonConversationId = followingConversations.find((conversationId: any) =>
                userConversations?.includes(conversationId)
            );
            return { ...following.toObject(), conversationId: commonConversationId };
        });

        res.status(200).json(updatedUserFollowings);
    } catch (err) {
        console.error(`Error fetching users: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getUserProfileDetails = async (req: Request, res: Response) => {
    try {
        let { role, userName } = req.query;

        if (!role || !userName) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = await User.findOne({ role, userName });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    } catch (err) {
        console.error(`Error fetching users: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getRecommendedUsers = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).populate("following");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const userFollowings: any = user.following;
        userFollowings.push(userId);
        const recommendedUsers = await User.find({
            _id: { $nin: userFollowings }, role: { $nin: ["admin", "venue"] }
        });
        res.status(200).json(recommendedUsers);
    } catch (err) {
        console.error(`Error fetching users: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const updateUserById = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const updates = req.body;
        const user = await User.findByIdAndUpdate(userId, updates, { new: true });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    } catch (err) {
        console.error(`Error updating user: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const toggleSavePost = async (req: Request, res: Response) => {
    try {
        const { userId, postId } = req.body;
        let message = ''
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // check if post is already saved
        if (user.savedPosts.includes(postId)) {
            const finalPosts = user.savedPosts.filter((id) => id.toString() !== postId);
            user.savedPosts = finalPosts;
            message = 'Post removed from saved posts'
        } else {
            user.savedPosts.push(postId);
            message = 'Post added to saved posts'
        }
        await user.save();
        res.status(200).json({ message });
    } catch (err) {
        console.error(`Error updating user: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const toggleFollowUser = async (req: Request, res: Response) => {
    try {
        const { currentUserId, selectedUserId } = req.body;
        const currentUser: any = await User.findById(currentUserId);
        const selectedUser: any = await User.findById(selectedUserId);
        if (!currentUser || !selectedUser) {
            return res.status(404).json({ error: "User not found" });
        }
        // check if current user is following the selected user
        if (currentUser.following.includes(selectedUserId)) {
            // unfollow
            currentUser.following.pull(selectedUserId);
            selectedUser.followers.pull(currentUserId);
        } else {
            // follow
            currentUser.following.push(selectedUserId);
            selectedUser.followers.push(currentUserId);
        }

        // first check if a conversation exists between the two users
        let checkConversation = await Conversation.findOne({ users: { $all: [currentUserId, selectedUserId] } });

        let convoId = checkConversation ? checkConversation._id : null;

        if (!checkConversation) {
            // create a conversation of the two users and push that conversation id into the users conversations array
            const conversation = new Conversation({ users: [currentUserId, selectedUserId] });
            await conversation.save();
            convoId = conversation._id;
            currentUser.conversations.push(conversation._id);
            selectedUser.conversations.push(conversation._id);
        }

        await currentUser.save();
        await selectedUser.save();
        res.status(200).json({ message: "Success", conversationId: convoId });
    } catch (err) {
        console.error(`Error updating user: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}



// get user following
// router.get("/following/:id", async (req: Request, res: Response) => {
//   try {
//     const userId = req.params.id;
//     const user = await User.findById(userId).populate("following");
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     const userFollowings = user.following;
//     userFollowings?.map((following: any) => {
//       const followingConversations = following.conversations;
//       const userConversations = user.conversations;
//       // Find the common conversationId
//       const commonConversationId = followingConversations.find((conversationId: any) =>
//         userConversations?.includes(conversationId)
//       );

//       return {...following._doc, conversationId : commonConversationId}
//     })
//     res.status(200).json(userFollowings);
//   } catch (err) {
//     console.error(`Error fetching users: ${err}`);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });