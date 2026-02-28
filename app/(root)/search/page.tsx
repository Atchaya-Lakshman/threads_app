import { currentUser } from "@clerk/nextjs/server";
import { fetchUsers, fetchUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import UserCard from "@/components/cards/UserCard";
import Searchbar from "@/components/shared/Searchbar";
import Pagination from "@/components/shared/Pagination";

interface SearchPageProps {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding");

    const params = await searchParams;
    const pageNumber = params?.page ? +params.page : 1;
    const searchQuery = params?.q || "";

    // Fetch users with search
    const results = await fetchUsers({
        userId: user.id,
        searchString: searchQuery,
        pageNumber,
        pageSize: 25,
    });

    return (
        <section>
            <h1 className="head-text mb-10">Search</h1>

            <Searchbar routeType="search" />

            <div className="mt-14 flex flex-col gap-9">
                {results.users.length === 0 ? (
                    <p className="no-result">
                        {searchQuery
                            ? "No users found matching your search"
                            : "No users found"}
                    </p>
                ) : (
                    <>
                        {results.users.map((searchUser) => (
                            <UserCard
                                key={searchUser.id}
                                id={searchUser.id}
                                name={searchUser.name}
                                username={searchUser.username}
                                imgUrl={searchUser.image}
                                personType="User"
                            />
                        ))}
                    </>
                )}
            </div>

            <Pagination
                path="search"
                pageNumber={pageNumber}
                isNext={results.isNext}
            />
        </section>
    );
}