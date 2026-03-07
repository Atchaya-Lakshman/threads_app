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
    const searchParams = useSearchParams(); // This is the key

    const handleNavigation = (direction: 'next' | 'prev') => {
        const nextPageNumber = direction === 'next' ? pageNumber + 1 : Math.max(1, pageNumber - 1);

        // 1. Create a new URLSearchParams object from the CURRENT URL
        const params = new URLSearchParams(searchParams.toString());

        // 2. Update ONLY the page number, keeping the 'q' (search) intact
        params.set('page', nextPageNumber.toString());

        // 3. Push the complete string (e.g., /?q=coding&page=2)
        router.push(`${path}?${params.toString()}`);
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
                    width={28}
                    height={28}
                    className='object-contain'
                />
                <span className="text-gray-1">Previous</span>
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
                <span className="text-gray-1">Next</span>
                <Image
                    src='/assets/arrow-right.svg'
                    alt='next'
                    width={28}
                    height={28}
                    className='object-contain'
                />
            </button>
        </div>
    );
}
