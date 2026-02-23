"use server"

import {connectToDB} from "@/lib/mongoose";
import User from "@/lib/models/user.model";
import {revalidatePath} from "next/cache";
import Thread from "@/lib/models/thread.model";
import {FilterQuery, SortOrder} from "mongoose";

interface Params {
    userId: string;
    name: string;
    username: string;
    bio: string;
    image: string;
    path: string;
}

export async function updateUser({
                                     userId,
                                     name,
                                     username,
                                     bio,
                                     image,
                                     path,
                                 }: Params): Promise<void> {
    try {
        await connectToDB();

        await User.findOneAndUpdate(
            {id: userId},
            {
                username: username.toLowerCase(),
                name,
                bio,
                image,
                onboarded: true,
            },
            {upsert: true}
        );

        if (path === 'profile/edit') {
            revalidatePath(path)
        }
    } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`);
    }
}

export async function fetchUser(userId: string) {
    try {
        await connectToDB();

        return await User
            .findOne({id: userId})
        // .populate({
        //     path: "community",
        //     model: Community,
        // });
    } catch (error: any) {
        throw new Error(`Failed to fetch user: ${error.message}`);
    }
}

export async function fetchUserPosts(userId: string) {
    try {
        await connectToDB();

        // Find all threads authored by user with the given userId
        return await User.findOne({id: userId})
            .populate({
                path: 'threads',
                model: Thread,
                populate: {
                    path: 'children',
                    model: Thread,
                    populate: {
                        path: 'author',
                        model: User,
                        select: 'name image id'
                    }
                }
            });
    } catch (error: any) {
        throw new Error(`Failed to fetch user posts: ${error.message}`);
    }
}


export default async function fetchUsers(
    {
        userId,
        searchString = "",
        pageNumber = 1,
        pageSize = 20,
        sortBy = "desc",
    }: {
        userId: string;
        searchString?: string;
        pageNumber?: number;
        pageSize?: number;
        sortBy?: SortOrder;
    }) {
    try {
        await connectToDB();
        const skipAmount = (pageNumber - 1) * pageSize;

        const regex = new RegExp(searchString, "i");

        const query: FilterQuery<typeof User> = {
            id: {$ne: userId},
        }
        if (searchString.trim() !== "") {
            query.$or = [
                {username: {$regex: regex}},
                {name: {$regex: regex}},
            ]
        }

        const sortOptions = {createdAt: sortBy};

        const usersQuery = User.find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize);

        const totalUsersCount = await User.countDocuments(query);

        const users = await usersQuery.exec();

        const isNext = totalUsersCount > skipAmount + users.length;

        return {users, isNext};
    } catch (error: any) {
        throw new Error(`Failed to fetch users: ${error.message}`);
    }
}

export async function getActivity(userId: string) {
    try {
        await connectToDB();

        // Find all threads created by user
        const userThreads = await Thread.find({author: userId});

        console.log("userThreads", userThreads)

        // Collect all the child thread ids (replies) from the 'children' field
        const childThreadIds = userThreads.flatMap(thread => thread.children);

        console.log("childThreadIds", childThreadIds)

        return await Thread.find({
            _id: {$in: childThreadIds},
            author: {$ne: userId},
        }).populate({
            path: 'author',
            model: User,
            select: 'name image _id'
        });
    } catch (error: any) {
        throw new Error(`Failed to fetch activity: ${error.message}`);
    }
}