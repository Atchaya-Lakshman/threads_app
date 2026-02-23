import {fetchUserPosts} from "@/lib/actions/user.actions";
import {redirect} from "next/navigation";
import Thread from "@/lib/models/thread.model";
import ThreadCard from "@/components/cards/ThreadCard";

interface Props {
    currentUserId: string;
    accountId: string;
    accountType: string;
}

const ThreadsTab = async ({
                              currentUserId,
                              accountId,
                              accountType
                          }: Props) => {
    let result = await fetchUserPosts(accountId)

    if (!result) redirect("/")

    console.log(result)

    return (
        <section className="mt-9 lex flex-col gap-10">
            {result.threads.map((thread: any) => (
                <ThreadCard
                    key={thread._id}
                    id={thread._id}
                    currentUserId={currentUserId}
                    parentId={thread.parentId}
                    content={thread.text}
                    author={
                        accountType === 'User' ?
                            {
                                name: result.name,
                                image: result.image,
                                id: result.id
                            } :
                            {
                                name: thread.name,
                                image: thread.image,
                                id: thread.id
                            }
                    }
                    community={thread.community}
                    createdAt={thread.createdAt}
                    comments={thread.children}
                />
            ))}
        </section>
    )
}

export default ThreadsTab