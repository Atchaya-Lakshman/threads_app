'use client';

import { SIDEBAR_LINKS, ROUTES } from "@/lib/constants";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SignedIn, SignOutButton, useAuth } from "@clerk/nextjs";

/**
 * LeftSidebar Component
 * Main navigation sidebar displayed on the left side of the application
 * Features:
 * - Dynamic route highlighting based on current pathname
 * - Profile link with user ID substitution
 * - Logout button for authenticated users
 */
function LeftSidebar() {
    const pathname = usePathname();
    const { userId } = useAuth();

    /**
     * Determine if a navigation link is active
     * A link is active if:
     * 1. Current path includes the link route AND the route is not just "/"
     * 2. OR the current path exactly matches the route
     */
    const isLinkActive = (linkRoute: string): boolean => {
        if (linkRoute === "/") {
            return pathname === "/";
        }
        return pathname.includes(linkRoute);
    };

    /**
     * Resolve the final route for navigation
     * Special handling for profile route to include user ID
     */
    const resolveFinalRoute = (linkRoute: string): string => {
        if (linkRoute === "/profile" && userId) {
            return `/profile/${userId}`;
        }
        return linkRoute;
    };

    return (
        <section className="custom-scrollbar leftsidebar">
            <div className="flex w-full flex-1 flex-col gap-6 px-6">
                {SIDEBAR_LINKS.map((link) => {
                    const isActive = isLinkActive(link.route);
                    const finalRoute = resolveFinalRoute(link.route);

                    return (
                        <Link
                            href={finalRoute}
                            key={link.label}
                            className={`leftsidebar_link ${
                                isActive ? "bg-primary-500" : ""
                            }`}
                            aria-current={isActive ? "page" : undefined}
                        >
                            <Image
                                src={link.imgURL}
                                alt={link.label}
                                height={24}
                                width={24}
                                priority={false}
                            />
                            <p className="text-light-1 max-lg:hidden">
                                {link.label}
                            </p>
                        </Link>
                    );
                })}
            </div>

            <div className="mt-10 px-6">
                <SignedIn>
                    <SignOutButton redirectUrl={ROUTES.SIGN_IN}>
                        <div className="flex cursor-pointer gap-4 p-4 rounded-lg hover:bg-dark-4 transition-colors">
                            <Image
                                src="/assets/logout.svg"
                                alt="Logout"
                                width={24}
                                height={24}
                                priority={false}
                            />
                            <p className="text-light-2 max-lg:hidden">Logout</p>
                        </div>
                    </SignOutButton>
                </SignedIn>
            </div>
        </section>
    );
}

export default LeftSidebar;