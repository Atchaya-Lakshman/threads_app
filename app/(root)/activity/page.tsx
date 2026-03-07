import {currentUser} from "@clerk/nextjs/server";
import {fetchUser, getActivity} from "@/lib/actions/user.actions";
import {redirect} from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const page = async () => {
    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding");

    // getActivity
    const activities = (await getActivity(String(userInfo.id))) || [];
    


    return (
        <section>
            <h1 className="head-text mb-10">
                Activity
            </h1>

            <section className="mt-10 flex flex-col gap-5">
                {activities.length > 0 ? (
                        <>
                            {activities.map((activity) => (
                                <Link key={activity._id} href={`/thread/${activity.parentId}`}>
                                    <article className="activity-card">
                                        <Image
                                            src={activity.author.image}
                                            alt="Profile Picture"
                                            width={24}
                                            height={24}
                                            className="rounded-full object-cover"
                                        />
                                        <p className="!text-small-regular text-light-1">
                                            <span className="mr-1 text-primary-500">
                                                {activity.author.name}
                                            </span> {" "}
                                            replied to your thread
                                        </p>
                                    </article>
                                </Link>
                            ))}
                        </>
                    ) :
                    <p className="!text-base-regular text-gray-1">No activity yet</p>
                }

            </section>
        </section>
    )
}

export default page;