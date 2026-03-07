"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Searchbar({ routeType }: { routeType: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const queryInUrl = searchParams.get("q") || "";
    const [search, setSearch] = useState(queryInUrl);

    // Sync local state if URL changes externally
    useEffect(() => {
        setSearch(queryInUrl);
    }, [queryInUrl]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());

            if (search !== queryInUrl) {
                if (search) {
                    params.set("q", search);
                } else {
                    params.delete("q");
                }
                params.set("page", "1");
                router.push(`${routeType === 'home' ? '/' : `/${routeType}`}?${params.toString()}`);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search, queryInUrl, router, routeType, searchParams]);

    return (
        <div className='relative flex w-full items-center'>
            {/* Search Icon */}
            <div className="absolute left-4 flex items-center pointer-events-none">
                <Image
                    src="/assets/search.svg"
                    alt="search"
                    width={20}
                    height={20}
                    className="opacity-50"
                />
            </div>

            <input
                type='text'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search threads, people, or tags...'
                className='w-full rounded-xl bg-dark-3 py-3 pl-12 pr-10 text-base-regular text-light-1 outline-none ring-1 ring-transparent transition-all focus:ring-primary-500 focus:bg-dark-2'
            />

            {/* Clear Button (The "X") */}
            {search && (
                <button
                    onClick={() => setSearch("")}
                    className="absolute right-4 flex items-center hover:opacity-80 transition-opacity"
                >
                    <Image
                        src="/assets/close.svg" // Or a generic X icon
                        alt="clear"
                        width={24}
                        height={24}
                    />
                </button>
            )}
        </div>
    );
}