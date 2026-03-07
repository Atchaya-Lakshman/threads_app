"use server";

import { revalidatePath } from "next/cache";
import { FilterQuery } from "mongoose";

import { connectToDB } from "../mongoose";

import User from "../models/user.model";
import Thread from "../models/thread.model";
import Community from "../models/community.model";

interface FetchThreadsParams {
    pageNumber?: number;
    pageSize?: number;
    searchString?: string;
}

interface FetchThreadsResult {
    posts: any[];
    isNext: boolean;
}

/**
 * Fetch threads with optional search and pagination
 */
export async function fetchThreads({
    pageNumber = 1,
    pageSize = 30,
    searchString = "",
}: FetchThreadsParams = {}): Promise<FetchThreadsResult> {
    await connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;

    // Build query with optional search
    const query: FilterQuery<typeof Thread> = {
        parentId: { $in: [null, undefined] },
    };

    // Add search filter if provided
    if (searchString.trim()) {
        const searchRegex = new RegExp(searchString, "i");
        query.text = { $regex: searchRegex };
    }

    const postsQuery = Thread.find(query)
        .sort({ createdAt: "desc" })
        .skip(skipAmount)
        .limit(pageSize)
        .populate({
            path: "author",
            model: User,
        })
        .populate({
            path: "community",
            model: Community,
        })
        .populate({
            path: "children",
            populate: {
                path: "author",
                model: User,
                select: "_id name parentId image",
            },
        });

    const totalPostsCount = await Thread.countDocuments(query);
    const posts = await postsQuery.exec();
    
    // Serialize posts to plain objects for client components
    const serializedPosts = JSON.parse(JSON.stringify(posts));
    
    const isNext = totalPostsCount > skipAmount + posts.length;

    return { posts: serializedPosts, isNext };
}

interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string,
}

export async function createThread({text, author, communityId, path}: Params
) {
    try {
        await connectToDB();

        // Resolve author: accept Clerk id (User.id) or Mongo _id
        const authorDoc = await User.findOne({ id: author }, { _id: 1 });
        const authorObjectId = authorDoc ? authorDoc._id : author;

        const communityDoc = communityId
            ? await Community.findOne({ id: communityId }, { _id: 1 })
            : null;

        const createdThread = await Thread.create({
            text,
            author: authorObjectId,
            community: communityDoc ? communityDoc._id : null, // Assign community _id if provided
        });

        // Update User model (push thread id onto user's threads array)
        await User.findByIdAndUpdate(authorObjectId, {
            $push: { threads: createdThread._id },
        });

        if (communityDoc) {
            // Update Community model using its _id
            await Community.findByIdAndUpdate(communityDoc._id, {
                $push: { threads: createdThread._id },
            });
        }

        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Failed to create thread: ${error.message}`);
    }
}

async function fetchAllChildThreads(threadId: string): Promise<any[]> {
    const childThreads = await Thread.find({parentId: threadId});

    const descendantThreads = [];
    for (const childThread of childThreads) {
        const descendants = await fetchAllChildThreads(childThread._id);
        descendantThreads.push(childThread, ...descendants);
    }

    return descendantThreads;
}

export async function deleteThread(id: string, path: string): Promise<void> {
    try {
        await connectToDB();

        // Find the thread to be deleted (the main thread)
        const mainThread = await Thread.findById(id).populate("author community");

        if (!mainThread) {
            throw new Error("Thread not found");
        }

        // Fetch all child threads and their descendants recursively
        const descendantThreads = await fetchAllChildThreads(id);

        // Get all descendant thread IDs including the main thread ID and child thread IDs
        const descendantThreadIds = [
            id,
            ...descendantThreads.map((thread) => thread._id),
        ];

        // Extract the authorIds and communityIds to update User and Community models respectively
        const uniqueAuthorIds = new Set(
            [
                ...descendantThreads.map((thread) => thread.author?._id?.toString()), // Use optional chaining to handle possible undefined values
                mainThread.author?._id?.toString(),
            ].filter((id) => id !== undefined)
        );

        const uniqueCommunityIds = new Set(
            [
                ...descendantThreads.map((thread) => thread.community?._id?.toString()), // Use optional chaining to handle possible undefined values
                mainThread.community?._id?.toString(),
            ].filter((id) => id !== undefined)
        );

        // Recursively delete child threads and their descendants
        await Thread.deleteMany({_id: {$in: descendantThreadIds}});

        // Update User model
        await User.updateMany(
            {_id: {$in: Array.from(uniqueAuthorIds)}},
            {$pull: {threads: {$in: descendantThreadIds}}}
        );

        // Update Community model
        await Community.updateMany(
            {_id: {$in: Array.from(uniqueCommunityIds)}},
            {$pull: {threads: {$in: descendantThreadIds}}}
        );

        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Failed to delete thread: ${error.message}`);
    }
}

export async function updateThread(id: string, newText: string, path: string) {
    try {
        await connectToDB();

        const thread = await Thread.findById(id);
        if (!thread) throw new Error('Thread not found');

        thread.text = newText;
        await thread.save();

        revalidatePath(path);

        return JSON.parse(JSON.stringify(thread));
    } catch (error: any) {
        throw new Error(`Failed to update thread: ${error.message}`);
    }
}

export async function fetchThreadById(threadId: string) {
    await connectToDB();

    try {
        const thread = await Thread.findById(threadId)
            .populate({
                path: "author",
                model: User,
                select: "_id id name image",
            }) // Populate the author field with _id and username
            .populate({
                path: "community",
                model: Community,
                select: "_id id name image",
            }) // Populate the community field with _id and name
            .populate({
                path: "children", // Populate the children field
                populate: [
                    {
                        path: "author", // Populate the author field within children
                        model: User,
                        select: "_id id name parentId image", // Select only _id and username fields of the author
                    },
                    {
                        path: "children", // Populate the children field within children
                        model: Thread, // The model of the nested children (assuming it's the same "Thread" model)
                        populate: {
                            path: "author", // Populate the author field within nested children
                            model: User,
                            select: "_id id name parentId image", // Select only _id and username fields of the author
                        },
                    },
                ],
            })
            .exec();

        // Serialize thread to plain object for client components
        return thread ? JSON.parse(JSON.stringify(thread)) : null;
    } catch (err) {
        console.error("Error while fetching thread:", err);
        throw new Error("Unable to fetch thread");
    }
}

export async function addCommentToThread(
    threadId: string,
    commentText: string,
    userId: string,
    path: string
) {
    await connectToDB();

    try {
        // Find the original thread by its ID
        const originalThread = await Thread.findById(threadId);

        if (!originalThread) {
            throw new Error("Thread not found");
        }

        // Create the new comment thread
        // Resolve the comment author (support Clerk id or Mongo _id)
        const authorDoc = await User.findOne({ id: userId }, { _id: 1 });
        const authorObjectId = authorDoc ? authorDoc._id : userId;

        const commentThread = new Thread({
            text: commentText,
            author: authorObjectId,
            parentId: threadId, // Set the parentId to the original thread's ID
        });

        // Save the comment thread to the database
        const savedCommentThread = await commentThread.save();

        // Add the comment thread's ID to the original thread's children array
        originalThread.children.push(savedCommentThread._id);

        // Save the updated original thread to the database
        await originalThread.save();

        revalidatePath(path);
    } catch (err) {
        console.error("Error while adding comment:", err);
        throw new Error("Unable to add comment");
    }
}

/**
 * Toggle like on a thread
 * Adds or removes the current user from the thread's likes array
 * Each user can only like once
 */
export async function toggleThreadLike(
    threadId: string,
    userId: string,
    path: string
) {
    try {
        await connectToDB();

        // Validate user
        if (!userId) {
            throw new Error("User must be signed in to like a thread");
        }

        // Check if user has already liked
        const thread = await Thread.findById(threadId);

        if (!thread) {
            throw new Error("Thread not found");
        }

        // Check if user ID exists in likes array (normalize existing values to string for comparison)
        const existingLikes = (thread.likes || []).map((l: any) => String(l));
        const hasLiked = existingLikes.includes(userId);

        let updatedThread;

        if (hasLiked) {
            // Remove like
            updatedThread = await Thread.findByIdAndUpdate(
                threadId,
                { $pull: { likes: userId } },
                { new: true }
            );
        } else {
            // Add like
            updatedThread = await Thread.findByIdAndUpdate(
                threadId,
                { $addToSet: { likes: userId } },
                { new: true }
            );
        }

        // If update did not return a document, fetch it
        if (!updatedThread) {
            updatedThread = await Thread.findById(threadId);
        }

        // Normalize likes to strings to avoid ObjectId/string mismatches
        let normalizedLikes = (updatedThread?.likes || []).map((l: any) => String(l));
        // If normalization changed the stored values, persist the normalized array
        const needsNormalization = JSON.stringify(normalizedLikes) !== JSON.stringify(updatedThread?.likes || []);
        if (needsNormalization) {
            updatedThread = await Thread.findByIdAndUpdate(
                threadId,
                { $set: { likes: normalizedLikes } },
                { new: true }
            );
            normalizedLikes = (updatedThread?.likes || []).map((l: any) => String(l));
        }

        // Calculate if liked based on updated thread
        const isNowLiked = normalizedLikes.includes(userId);

        // Debug: like toggled (removed verbose logging in production)

        revalidatePath(path);

        return {
            success: true,
            isLiked: isNowLiked,
            likeCount: updatedThread?.likes?.length || 0,
        };
    } catch (error) {
        console.error("Error toggling like:", error);
        throw new Error("Failed to toggle like");
    }
}