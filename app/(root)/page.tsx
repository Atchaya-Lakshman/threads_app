import { fetchThreads } from "@/lib/actions/thread.actions";
import { currentUser } from "@clerk/nextjs/server";
import ThreadCard from "@/components/cards/ThreadCard";
import Searchbar from "@/components/shared/Searchbar";
import Pagination from "@/components/shared/Pagination";

interface HomeProps {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
    const user = await currentUser();
    if (!user) return null;

    const params = await searchParams;
    const pageNumber = params?.page ? +params.page : 1;
    const searchQuery = params?.q || "";

    const result = await fetchThreads({
        pageNumber,
        pageSize: 30,
        searchString: searchQuery,
    });

    return (
        <>
            <h1 className="head-text text-left">Home</h1>

            <div className="mt-9 flex gap-3 flex-col gap-9">
                <Searchbar routeType="home" />
            </div>

            <section className="mt-9 flex flex-col gap-10">
                {result.posts.length === 0 ? (
                    <p className="no-result">
                        {searchQuery
                            ? "No threads found matching your search"
                            : "No threads found"}
                    </p>
                ) : (
                    <>
                        {result.posts.map((post) => (
                            <ThreadCard
                                key={post._id}
                                id={post._id}
                                currentUserId={user?.id || ""}
                                parentId={post.parentId}
                                content={post.text}
                                author={post.author}
                                community={post.community}
                                createdAt={post.createdAt}
                                comments={post.children}
                                initialLikes={(post.likes || []).map((like: any) =>
                                    typeof like === 'string' ? like : String(like)
                                )}
                            />
                        ))}
                    </>
                )}
            </section>

            <Pagination
                path="/"
                pageNumber={pageNumber}
                isNext={result.isNext}
            />
        </>
    );
}