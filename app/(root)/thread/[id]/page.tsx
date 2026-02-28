import ThreadCard from "@/components/cards/ThreadCard";
import {currentUser} from "@clerk/nextjs/server";
import {fetchUser} from "@/lib/actions/user.actions";
import {redirect} from "next/navigation";
import {fetchThreadById} from "@/lib/actions/thread.actions";
import Comment from "@/components/forms/Comment";

const page = async ({params}: { params: { id: string } }) => {

    const {id} = await params;
    if (!id) return null;

    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect('/onboarding');

    const thread = await fetchThreadById(id);

    return (
        <section>
            <div>
                <ThreadCard
                    key={thread._id}
                    id={thread._id}
                    currentUserId={user?.id || ""}
                    parentId={thread.parentId}
                    content={thread.text}
                    author={thread.author}
                    community={thread.community}
                    createdAt={thread.createdAt}
                    comments={thread.children}
                    initialLikes={(thread.likes || []).map((like: any) =>
                        typeof like === 'string' ? like : String(like)
                    )}
                    showCommentPreview={false}
                />
            </div>

            <div className="mt-7">
                <Comment
                    threadId={id}
                    currentUserImg={userInfo.image}
                    currentUserId={JSON.stringify(userInfo._id)}
                />
            </div>

            <div className="mt-10">
                {thread.children.map((childItem: any) => (
                    <ThreadCard
                        key={childItem._id}
                        id={childItem._id}
                        currentUserId={user?.id || ""}
                        parentId={childItem.parentId}
                        content={childItem.text}
                        author={childItem.author}
                        community={childItem.community}
                        createdAt={childItem.createdAt}
                        comments={childItem.children}
                        isComment={true}
                        initialLikes={(childItem.likes || []).map((like: any) =>
                            typeof like === 'string' ? like : String(like)
                        )}
                    />
                ))}
            </div>

        </section>
    )
}

export default page