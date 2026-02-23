import {currentUser} from "@clerk/nextjs/server";
import fetchUsers, {fetchUser} from "@/lib/actions/user.actions";
import {redirect} from "next/navigation";
import UserCard from "@/components/cards/UserCard";

const page = async () => {
    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding");

    // Fetch users
    const results = await fetchUsers({
        userId: user.id,
        searchString: "",
        pageNumber: 1,
        pageSize: 25
    })

    return (
        <section>
            <h1 className="head-text mb-10">
                Search
            </h1>


            <div className="mt-14 flex flex-col gap-9">

                {results.users.length === 0 ? (
                    <p className="no-result">No users</p>
                ) : (
                    <>
                    {results.users.map(user => (
                        <UserCard
                            key={user.id}
                            id={user.id}
                            name={user.name}
                            username={user.username}
                            imgUrl={user.image}
                            personType='User'
                        />
                    ))}
                    </>
                )}
            </div>
        </section>
    )
}

export default page;