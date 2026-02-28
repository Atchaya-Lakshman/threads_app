'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

interface PaginationProps {
    path: string;
    pageNumber: number;
    isNext: boolean;
}

/**
 * Pagination Component
 * Handles navigation between pages
 * Preserves search query parameters when navigating
 */
export default function Pagination({
    path,
    pageNumber,
    isNext,
}: PaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleNavigation = (direction: 'next' | 'prev') => {
        const nextPageNumber =
            direction === 'next' ? pageNumber + 1 : Math.max(1, pageNumber - 1);

        // Build URL with search params if they exist
        const query = searchParams.get('q');
        const pathWithPage =
            path === '/'
                ? `/`
                : `/${path}`;

        const url = new URL(
            `${pathWithPage}?page=${nextPageNumber}`,
            window.location.origin
        );

        if (query) {
            url.searchParams.set('q', query);
        }

        router.push(url.toString());
    };

    if (pageNumber === 1 && !isNext) {
        return null;
    }

    return (
        <div className='pagination'>
            <button
                onClick={() => handleNavigation('prev')}
                disabled={pageNumber === 1}
                className='pagination_button'
                aria-label='Previous page'
            >
                <Image
                    src='/assets/arrow-left.svg'
                    alt='previous'
                    width={16}
                    height={16}
                    className='object-contain'
                />
                <span>Previous</span>
            </button>

            <span className='pagination_page-number'>
                Page {pageNumber}
            </span>

            <button
                onClick={() => handleNavigation('next')}
                disabled={!isNext}
                className='pagination_button'
                aria-label='Next page'
            >
                <span>Next</span>
                <Image
                    src='/assets/arrow-right.svg'
                    alt='next'
                    width={16}
                    height={16}
                    className='object-contain'
                />
            </button>
        </div>
    );
}
