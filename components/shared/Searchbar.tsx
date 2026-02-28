'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useDebounce } from '@/lib/hooks';

interface SearchbarProps {
    routeType: 'search' | 'home';
}

/**
 * Searchbar Component
 * Provides search functionality for both user search and thread search
 * - Debounced search input to reduce API calls
 * - Dynamic routing based on routeType
 * - Search parameter handling via URL
 */
export default function Searchbar({ routeType }: SearchbarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState('');

    // Get initial search query from URL params
    useEffect(() => {
        const query = searchParams.get('q') || '';
        setSearch(query);
    }, [searchParams]);

    // Debounce the search input
    const debouncedSearch = useDebounce(search, 300);

    // Handle search updates
    useEffect(() => {
        // Determine the base path
        const basePath = routeType === 'home' ? '/' : `/${routeType}`;

        if (debouncedSearch) {
            router.push(`${basePath}?q=${encodeURIComponent(debouncedSearch)}`);
        } else if (searchParams.has('q')) {
            // Clear search if input is empty
            router.push(basePath);
        }
    }, [debouncedSearch, routeType, router, searchParams]);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setSearch(e.target.value);
        },
        []
    );

    const handleClear = useCallback(() => {
        setSearch('');
        const basePath = routeType === 'home' ? '/' : `/${routeType}`;
        router.push(basePath);
    }, [routeType, router]);

    return (
        <div className='searchbar'>
            <Image
                src='/assets/search.svg'
                alt='search'
                width={24}
                height={24}
                className='object-contain'
            />
            <input
                type='text'
                placeholder={
                    routeType === 'search'
                        ? 'Search users...'
                        : 'Search threads...'
                }
                value={search}
                onChange={handleChange}
                className='no-focus searchbar_input'
            />

            {search && (
                <button
                    onClick={handleClear}
                    className='ml-auto flex-shrink-0 text-light-2 hover:text-light-1 transition-colors'
                    aria-label='Clear search'
                >
                    <Image
                        src='/assets/close.svg'
                        alt='clear'
                        width={20}
                        height={20}
                        className='object-contain'
                    />
                </button>
            )}
        </div>
    );
}
