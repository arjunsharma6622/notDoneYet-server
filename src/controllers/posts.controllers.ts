import { Request, Response } from "express";
import { Comment, Post } from "../models/post.model";
import { User } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

export const getAllPosts = async (_req: Request, res: Response) => {
    try {
        const posts = await Post.find();
        res.status(200).json(posts);
    } catch (err) {
        console.error(`Error fetching posts: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getPostById = async (req: Request, res: Response) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId)
            .populate({
                path: "user",
                select: "name image bio followers following role userName",
            })
            .populate({
                path: "comments",
                populate: { path: "user", select: "name image" },
            })
            .populate({ path: "likes", select: "name image _id" })
            .sort({ createdAt: -1 });

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        res.status(200).json(post);
    } catch (err) {
        console.error(`Error fetching posts: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getPostsByUser = async (req: Request, res: Response) => {
    try {
        const { userId, userName } = req.query;

        if (!userId && !userName) {
            return res.status(400).json({ error: "User ID or User Name not provided" });
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

        const posts = await Post.find({ user: user._id })
            .populate({ path: "user", select: "name image bio role followers userName" })
            .populate({
                path: "comments",
                populate: { path: "user", select: "name image" },
            })
            .populate({ path: "likes", select: "name image" })
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (err) {
        console.error(`Error fetching posts: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


export const deletePost = async (req: Request, res: Response) => {
    try {
        const postId = req.params.id;
        const post = await Post.findByIdAndDelete(postId);
        res.status(200).json(post);
    } catch (err) {
        console.error(`Error deleting post: ${err}`);
        res.status(500).json({ message: err });
    }
}

/* --- SECURE CONTROLLERS --- */


export const getRecommendedPosts = async (req: any, res: Response) => {
    const userId = req?.user?._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    try {
        // Find the user and populate their following list with only the posts field
        const user = await User.findById(userId)
            .populate({
                path: "following",
                select: "posts",
            })
            .lean();

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Get the posts from the users that the current user is following
        const followingUserPosts = user?.following?.flatMap((f: any) => f.posts) || [];

        // Find the recommended posts from the users that the current user is following
        const recommendedPosts = await Post.find({
            _id: { $in: followingUserPosts },
        })
            .populate({
                path: "user",
                select: "name image bio role userName followers",
            })
            .populate({
                path: "comments",
                populate: {
                    path: "user",
                    select: "name image bio role _id",
                },
            })
            .populate({ path: "likes", select: "name image _id" })
            .sort({ createdAt: -1 })
            .lean();

        // Find the remaining posts not in followingUserPosts
        const remainingPosts = await Post.find({
            _id: { $nin: [...followingUserPosts] },
            user: { $ne: userId }
        })
            .populate({
                path: "user",
                select: "name image bio role userName followers",
            })
            .populate({
                path: "comments",
                populate: {
                    path: "user",
                    select: "name image bio role _id",
                },
            })
            .populate({ path: "likes", select: "name image _id" })
            .sort({ createdAt: -1 })
            .lean();

        // Combine recommendedPosts and remainingPosts
        const allPosts = [...recommendedPosts, ...remainingPosts];

        // Paginate the combined results
        const paginatedPosts = allPosts.slice((page - 1) * limit, page * limit);

        // Format the posts to include the number of comments and likes
        const formattedPosts = paginatedPosts.map(post => ({
            ...post,
            numComments: post.comments?.length,
            numLikes: post.likes?.length,
        }));

        res.status(200).json(formattedPosts);
    } catch (err) {
        console.error(`Error fetching posts: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const createPost = asyncHandler(async (req: any, res: Response) => {
    const userId = req.user._id;
    const { postData } = req.body;
    const newPost = new Post({
        user: userId,
        ...postData
    })
    await newPost.save();
    res.status(201).json(new ApiResponse(201, newPost, "Post created successfully"))
})

export const togglePostLike = asyncHandler(async (req: any, res: Response) => {
    let message = "";

    const { postId } = req.body;
    const userId = req.user._id;

    const post : any = await Post.findById(postId);
    if (!post)  throw new ApiError(404, "Post not found");

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    if (post.likes.includes(userId)) {
        post.likes = post.likes.filter((like: any) => like != userId);
        message = "Post unliked";
        } else {
        post.likes.push(userId);
        message = "Post liked";
    }

    await post.save();
    res.status(200).json(new ApiResponse(200, message))
})

export const addComment = asyncHandler(async (req: any, res: Response) => {
    const userId = req.user._id;
    const { postId, parentCommentId, commentText } = req.body;

    const user : any = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const post : any = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const parentComment : any = parentCommentId
        ? await Comment.findById(parentCommentId)
        : null;



    if (parentComment && parentComment.parentComment) {
        throw new ApiError(400, "Nesting beyond one level is not allowed");
    }

    // create a new comment
    const newComment = new Comment({
        user: userId,
        post: postId,
        parentComment: parentCommentId || null,
        commentText
    });



    // Add the new comment to the post's comments array
    post.comments.push(newComment._id);
    await post.save();
  
      // If the new comment is a reply, add it to the parent comment's replies array
      if (parentComment) {
        parentComment.replies.push(newComment._id);
        await parentComment.save();
    }


    return res.status(201).json(new ApiResponse(201, newComment, "Comment added successfully"))
})