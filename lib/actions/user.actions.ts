"use server";

import { FilterQuery, SortOrder } from "mongoose";
import { revalidatePath } from "next/cache";

import Community from "../models/community.model";
import Thread from "../models/thread.model";
import User from "../models/user.model";

import { connectToDB } from "../mongoose";

// ============= Type Definitions =============

interface UpdateUserParams {
    userId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
    path: string;
}

interface FetchUsersParams {
    userId: string;
    searchString?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: SortOrder;
}

interface FetchUsersResult {
    users: any[];
    isNext: boolean;
}

interface UserDocument {
    id: string;
    username: string;
    name: string;
    image?: string;
    bio?: string;
    onboarded: boolean;
    communities: string[];
    threads: string[];
}

// ============= Error Handler =============

class UserActionError extends Error {
    constructor(public action: string, message: string) {
        super(`${action} failed: ${message}`);
        this.name = "UserActionError";
    }
}

// ============= Helper Functions =============

const handleError = (action: string, error: unknown): never => {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`${action} error:`, message);
    throw new UserActionError(action, message);
};

const createSearchRegex = (searchString: string): RegExp => {
    return new RegExp(searchString.trim(), "i");
};

const buildUserSearchQuery = (
    userId: string,
    searchString: string
): FilterQuery<typeof User> => {
    const query: FilterQuery<typeof User> = {
        id: { $ne: userId },
    };

    if (searchString.trim()) {
        const regex = createSearchRegex(searchString);
        query.$or = [{ username: { $regex: regex } }, { name: { $regex: regex } }];
    }

    return query;
};

// ============= User Actions =============

/**
 * Fetch a single user by ID with their communities
 */
export async function fetchUser(userId: string): Promise<UserDocument | null> {
    try {
        await connectToDB();

        const user = await User.findOne({ id: userId }).populate({
            path: "communities",
            model: Community,
        });

        return user;
    } catch (error) {
        handleError("fetchUser", error);
    }
}

/**
 * Create or update user profile
 */
export async function updateUser(params: UpdateUserParams): Promise<void> {
    const { userId, bio, name, path, username, image } = params;

    try {
        await connectToDB();

        await User.findOneAndUpdate(
            { id: userId },
            {
                username: username.toLowerCase(),
                name,
                bio,
                image,
                onboarded: true,
            },
            { upsert: true }
        );

        if (path === "/profile/edit") {
            revalidatePath(path);
        }
    } catch (error) {
        handleError("updateUser", error);
    }
}

/**
 * Fetch all threads authored by a user with related data
 */
export async function fetchUserPosts(userId: string) {
    try {
        await connectToDB();

        const userWithThreads = await User.findOne({ id: userId }).populate({
            path: "threads",
            model: Thread,
            populate: [
                {
                    path: "community",
                    model: Community,
                    select: "name id image _id",
                },
                {
                    path: "children",
                    model: Thread,
                    populate: {
                        path: "author",
                        model: User,
                        select: "name image id",
                    },
                },
            ],
        });

        // Serialize to plain object for client components
        return userWithThreads ? JSON.parse(JSON.stringify(userWithThreads)) : null;
    } catch (error) {
        handleError("fetchUserPosts", error);
    }
}

/**
 * Fetch users with search, pagination, and sorting
 */
export async function fetchUsers(
    params: FetchUsersParams
): Promise<FetchUsersResult> {
    const {
        userId,
        searchString = "",
        pageNumber = 1,
        pageSize = 20,
        sortBy = "desc",
    } = params;

    try {
        await connectToDB();

        const skipAmount = (pageNumber - 1) * pageSize;
        const query = buildUserSearchQuery(userId, searchString);
        const sortOptions = { createdAt: sortBy };

        const [users, totalUsersCount] = await Promise.all([
            User.find(query)
                .sort(sortOptions)
                .skip(skipAmount)
                .limit(pageSize)
                .exec(),
            User.countDocuments(query),
        ]);

        const isNext = totalUsersCount > skipAmount + users.length;

        return { users, isNext };
    } catch (error) {
        handleError("fetchUsers", error);
    }
}

/**
 * Get activity (replies) for a user from other users
 */
export async function getActivity(userId: string) {
    try {
        await connectToDB();

        // Find all threads created by the user
        const userThreads = await Thread.find({ author: userId });

        // Collect all child thread IDs
        const childThreadIds = userThreads.flatMap((thread) => thread.children);

        if (childThreadIds.length === 0) {
            return [];
        }

        // Find replies from other users
        const replies = await Thread.find({
            _id: { $in: childThreadIds },
            author: { $ne: userId },
        }).populate({
            path: "author",
            model: User,
            select: "name image _id",
        });

        return replies;
    } catch (error) {
        handleError("getActivity", error);
    }
}