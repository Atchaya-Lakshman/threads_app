'use client';

import Link from "next/link";
import Image from "next/image";
import {formatDateString} from "@/lib/utils";
import {Tooltip} from "@/components/ui/tooltip";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {toggleThreadLike, updateThread, deleteThread} from "@/lib/actions/thread.actions";

interface Props {
    id: string;
    currentUserId?: string | null;
    parentId: string | null;
    content: string;
    author: {
        name: string;
        image?: string;
        id: string;
    }
    community: {
        id: string;
        name: string;
        image?: string;
    } | null;
    createdAt: string | Date;
    comments: any[];
    isComment?: boolean;
    initialLikes?: string[];
    showCommentPreview?: boolean;
}

const ThreadCard = ({
                        id,
                        currentUserId,
                        parentId,
                        content,
                        author,
                        community,
                        createdAt,
                        comments,
                        isComment,
                        showCommentPreview = true,
                        initialLikes = [],
                    }: Props) => {
    const [likes, setLikes] = useState<string[]>(initialLikes);
    const [contentState, setContentState] = useState(content);
    const [isLiking, setIsLiking] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(content);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const uid = currentUserId ?? "";
    const isLiked = likes.includes(uid);

    const handleLike = async () => {
        if (isLiking) return;

        setIsLiking(true);
        const previousLikes = likes;
        const isCurrentlyLiked = likes.includes(uid);

        try {

            // Optimistic update immediately
            if (isCurrentlyLiked) {
                setLikes(likes.filter(x => x !== uid));
            } else {
                if (uid) setLikes([...likes, uid]);
            }

            // Call the server to persist
            const result = await toggleThreadLike(
                id,
                uid,
                isComment ? `/thread/${parentId}` : "/"
            );

            // After server responds, sync state with server state
            // result.isLiked is the NEW state after toggle
            if (result.isLiked) {
                // Server confirms it's now liked
                setLikes(prev => {
                    if (!prev.includes(uid) && uid) {
                        return [...prev, uid];
                    }
                    return prev as string[];
                });
            } else {
                // Server confirms it's now unliked
                setLikes(prev => prev.filter(x => x !== uid));
            }
        } catch (error) {
            console.error("Error liking thread:", error);
            // Revert to previous state on error
            setLikes(previousLikes);
        } finally {
            setIsLiking(false);
        }
    };

    return (
        <article className={`flex w-full flex-col rounded-xl 
            ${isComment ? 'px-0 xs:px-7' : 'bg-dark-2 p-7'}`}>

            <div className="flex items-start justify-between">

                <div className="flex w-full flex-1 flex-row gap-4">

                    <div className="flex flex-col items-center">
                        <Link href={`/profile/${author.id}`} className="relative h-11 w-11">
                            <Image
                                src={author.image || '/assets/user.svg'}
                                alt="Profile Image"
                                fill
                                className={"cursor-pointer rounded-full"}
                            />
                        </Link>

                        <div className="thread-card_bar"/>
                    </div>
                    <div className="flex w-full flex-col">
                        <Link href={`/profile/${author.id}`} className="w-fit">
                            <h4 className="cursor-pointer text-base-semibold text-light-1">{author.name}</h4>
                        </Link>


                        <div className="mt-2">
                            {!isEditing ? (
                                <p className="text-small-regular text-light-2">{contentState}</p>
                            ) : (
                                <div>
                                    <textarea
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="w-full rounded-md p-2 bg-dark-1 text-light-1"
                                        rows={4}
                                    />
                                    <div className="mt-2 flex gap-2">
                                        <button
                                            onClick={async () => {
                                                if (isSaving) return;
                                                setIsSaving(true);
                                                try {
                                                    const updated = await updateThread(
                                                        id,
                                                        editText,
                                                        isComment ? `/thread/${parentId}` : "/"
                                                    );
                                                    setContentState(updated?.text || editText);
                                                    setIsEditing(false);
                                                } catch (err) {
                                                    console.error(err);
                                                } finally {
                                                    setIsSaving(false);
                                                }
                                            }}
                                            className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50"
                                            disabled={isSaving}
                                        >
                                            {isSaving ? "Saving..." : "Save"}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                setEditText(contentState);
                                            }}
                                            className="rounded bg-neutral-700 px-3 py-1 text-light-1"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={`${isComment && 'mb-8'} mt-5 flex flex-row gap-3.5 items-center`}>
                            <Tooltip content={isLiked ? "Unlike" : "Like"} position="bottom">
                                <button
                                    onClick={handleLike}
                                    disabled={isLiking}
                                    className="flex items-center gap-1.5 hover:opacity-80 transition-opacity disabled:opacity-50"
                                >
                                    <Image
                                        src={isLiked ? "/assets/heart.svg" : "/assets/heart-gray.svg"}
                                        alt="heart"
                                        width={24}
                                        height={24}
                                        className="cursor-pointer object-contain"
                                        style={isLiked ? {filter: 'hue-rotate(0deg) saturate(150%)'} : undefined}
                                    />
                                    {likes.length > 0 && (
                                        <span className={`text-xs font-medium ${
                                            isLiked ? 'text-red-500' : 'text-light-3'
                                        }`}>
                                            {likes.length}
                                        </span>
                                    )}
                                </button>
                            </Tooltip>
                            <Tooltip content="Reply" position="bottom">
                                <Link href={`/thread/${id}`}>
                                    <Image src={"/assets/reply.svg"} alt="reply" width={24} height={24}
                                           className="cursor-pointer object-contain hover:opacity-80 transition-opacity"/>
                                </Link>
                            </Tooltip>
                            <Tooltip content="Repost" position="bottom">
                                <Image src={"/assets/repost.svg"} alt="repost" width={24} height={24}
                                       className="cursor-pointer object-contain hover:opacity-80 transition-opacity"/>
                            </Tooltip>
                            <Tooltip content="Share" position="bottom">
                                <Image src={"/assets/share.svg"} alt="share" width={24} height={24}
                                       className="cursor-pointer object-contain hover:opacity-80 transition-opacity"/>
                            </Tooltip>
                            {currentUserId === author.id && (
                                <>
                                    <Tooltip content="Edit" position="bottom">
                                        <button
                                            onClick={() => {
                                                setIsEditing(true);
                                                setEditText(contentState);
                                            }}
                                            className="flex items-center justify-center w-8 h-8 rounded hover:opacity-80"
                                            aria-label="Edit thread"
                                        >
                                            <Image src={'/assets/edit.svg'} alt="edit" width={18} height={18}/>
                                        </button>
                                    </Tooltip>
                                    <Tooltip content="Delete" position="bottom">
                                        <button
                                            onClick={async () => {
                                                if (isDeleting) return;
                                                const ok = confirm('Delete this thread?');
                                                if (!ok) return;
                                                setIsDeleting(true);
                                                try {
                                                    await deleteThread(
                                                        id,
                                                        isComment ? `/thread/${parentId}` : "/"
                                                    );
                                                    if (!isComment && !parentId) {
                                                        router.push('/');
                                                    }
                                                } catch (err) {
                                                    console.error(err);
                                                } finally {
                                                    setIsDeleting(false);
                                                }
                                            }}
                                            className="flex items-center justify-center w-8 h-8 rounded hover:opacity-80 disabled:opacity-50"
                                            disabled={isDeleting}
                                            aria-label="Delete thread"
                                        >
                                            {isDeleting ? (
                                                <span className="text-xs">...</span>
                                            ) : (
                                                <Image src={'/assets/delete.svg'} alt="delete" width={18} height={18}/>
                                            )}
                                        </button>
                                    </Tooltip>
                                </>
                            )}
                        </div>

                        {isComment && !community && (
                            <div className='flex items-center'>
                                {(comments || []).map((c, index) => {
                                    const img = c?.author?.image;
                                    if (!img || typeof img !== 'string' || img.trim() === '') return null;
                                    return (
                                        <Image
                                            key={index}
                                            src={img}
                                            alt={`user_${index}`}
                                            width={28}
                                            height={28}
                                            className={`${index !== 0 ? "-ml-2" : ""} rounded-full object-cover`}
                                        />
                                    );
                                })}
                                {(comments || []).length > 3 && (
                                    <p className='ml-1 text-subtle-medium text-gray-1'>
                                        {(comments || []).length}+ Users
                                    </p>
                                )}
                            </div>
                        )}

                        {isComment && comments.length > 0 && (
                            <Link href={`/thread/${id}`}>
                                <p className="mb-3.5 text-subtle-medium text-gray-1">{comments.length}
                                    {comments.length > 1 ? ' replies' : ' reply'}</p>
                                <div className="mb-4"></div>
                            </Link>
                        )}

                        {/* Show avatars of users who commented on the parent thread (like real thread apps) */}
                        {!isComment && showCommentPreview && comments.length > 0 && (
                            <div className="mt-3">
                                <Link href={`/thread/${id}`} className="flex items-center gap-3">
                                    <div className="flex -space-x-2">
                                        {comments.slice(0, 3).map((c: any, idx: number) => {
                                            const img = c?.author?.image;
                                            if (!img || typeof img !== 'string' || img.trim() === '') return null;
                                            return (
                                                <Image
                                                    key={idx}
                                                    src={img}
                                                    alt={`commenter_${idx}`}
                                                    width={28}
                                                    height={28}
                                                    className={`${idx !== 0 ? "-ml-2" : ""} rounded-full object-cover border-2 border-dark-1`}
                                                />
                                            );
                                        })}
                                    </div>

                                    <p className="text-subtle-medium text-gray-1">
                                        {comments.length} {comments.length > 1 ? 'replies' : 'reply'}
                                    </p>
                                </Link>

                                {/* Reply preview: show latest comment snippet */}
                                {comments[0] && comments[0].text && (
                                    <Link href={`/thread/${id}`}
                                          className="block mt-2 text-small-regular text-light-2 truncate">
                                        {String(comments[0].text).length > 120 ? `${String(comments[0].text).slice(0, 120)}...` : String(comments[0].text)}
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {!isComment && community && (
                <Link href={`/communities/${community.id}`} className="mt-5 flex items-center">
                    <p className="text-subtle-medium text-gray-1">
                        {formatDateString(String(createdAt))}
                        {" "} - {community.name} Community
                    </p>

                    {community.image && community.image.trim() !== "" && (
                        <Image
                            src={community.image}
                            alt={community.name}
                            width={14}
                            height={14}
                            className="ml-1 rounded-full object-cover"
                        />
                    )}
                </Link>
            )}


        </article>
    )

}

export default ThreadCard;