import { Request, Response } from "express";
import { Conversation } from "../models/conversation.model";
import { User } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";


export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
        const { roles } = req.query;
        if (roles) {
            const rolesArray = roles.toString().trim().split(',');
            const users = await User.find({ role: { $in: rolesArray } });
            if (!users) throw new ApiError(404, "No users found");
            return res.status(200).json(new ApiResponse(200, { users }, "Users fetched successfully"));        
        }
        const users = await User.find();
        if (!users) throw new ApiError(404, "No users found");
        return res.status(200).json(new ApiResponse(200, { users }, "Users fetched successfully"));
})

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

/* --- SECURE CONTROLLERS --- */

export const getAuthenticatedUser = asyncHandler(async (req: any, res: Response) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken");

    if (!user) throw new ApiError(404, "User not found")

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "User fetched successfully"
            )
        )
})

export const getUserFollowing = asyncHandler(async (req: any, res: Response) => {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("following");

    if (!user) throw new ApiError(404, "User not found")

    const userConversations = user.conversations;

    const updatedUserFollowings = user?.following?.map((following: any) => {
        const followingConversations = following.conversations;
        // Find the common conversationId
        const commonConversationId = followingConversations.find((conversationId: any) =>
            userConversations?.includes(conversationId)
        );
        return { ...following.toObject(), conversationId: commonConversationId };
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { userFollowings: updatedUserFollowings },
                "User followings fetched successfully"
            )
        )

})

export const toggleFollowUser = asyncHandler(async (req: any, res: Response) => {
    const { selectedUserId } = req.body;
    let messageToSend = "";
    const currentUserId = req.user._id;
    const currentUser: any = await User.findById(currentUserId);
    const selectedUser: any = await User.findById(selectedUserId);
    if (!currentUser || !selectedUser) throw new ApiError(404, "User not found");

    // check if current user is following the selected user
    if (currentUser.following.includes(selectedUserId)) {
        // unfollow
        messageToSend = "User unfollowed";
        currentUser.following.pull(selectedUserId);
        selectedUser.followers.pull(currentUserId);
    } else {
        // follow
        messageToSend = "User followed";
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


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { conversationId: convoId },
                messageToSend
            )
        )
})

export const toggleProfileLike = asyncHandler(async (req: any, res: Response) => {
    const { profileId } = req.body;
    const userId = req.user._id;

    // Fetch the profile and user from the database
    const profile: any = await User.findById(profileId);
    if (!profile) throw new ApiError(404, "Profile not found");

    const user: any = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    let messageToSend = "";

    // Check if the profile is already liked by the user
    const isLiked = user.likedProfiles.includes(profileId);

    if (isLiked) {
        // If already liked, then unlike
        user.likedProfiles = user.likedProfiles.filter((id: string) => id.toString() !== profileId.toString());
        profile.profileLikes = profile.profileLikes.filter((id: string) => id.toString() !== userId.toString());

        messageToSend = "Profile unliked";
    } else {
        // If not liked, then like
        user.likedProfiles.push(profileId);
        profile.profileLikes.push(userId);

        messageToSend = "Profile liked";
    }

    // Save the changes to the user and profile
    await user.save();
    await profile.save();

    const val = messageToSend === "Profile liked" ? 1 : -1;

    // Return a success response
    return res.status(200).json(new ApiResponse(200, { liked : val } , messageToSend));
});

export const getRecommendedUsers = asyncHandler(async (req: any, res: Response) => {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("following");
    if (!user) throw new ApiError(404, "User not found");

    const userFollowings: any = user.following;
    userFollowings.push(userId);

    const recommendedUsers = await User.find({
        _id: { $nin: userFollowings }, role: { $nin: ["admin", "venue"] }
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { recommendedUsers },
                "Recommended users fetched successfully"
            )
        )
})

export const updateUser = asyncHandler(async (req: any, res: Response) => {
    const userId = req.user._id;
    const updates = req.body;
    // console.log(updates);
    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.status(200).json(new ApiResponse(200, user, "User updated successfully"));
})