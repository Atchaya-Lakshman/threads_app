'use client';

import React, { useState, useEffect } from 'react';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
}

/**
 * Tooltip Component
 * Displays helpful text when hovering over an element
 */
export function Tooltip({
    content,
    children,
    position = 'top',
    delay = 200,
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

    // Clear tooltip when content changes
    useEffect(() => {
        setIsVisible(false);
        if (timeoutId) {
            clearTimeout(timeoutId);
            setTimeoutId(null);
        }
    }, [content]);

    const handleMouseEnter = () => {
        const id = setTimeout(() => setIsVisible(true), delay);
        setTimeoutId(id);
    };

    const handleMouseLeave = () => {
        if (timeoutId) clearTimeout(timeoutId);
        setIsVisible(false);
    };

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 border-t-light-2',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-light-2',
        left: 'left-full top-1/2 -translate-y-1/2 border-l-light-2',
        right: 'right-full top-1/2 -translate-y-1/2 border-r-light-2',
    };

    return (
        <div
            className='relative inline-block'
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}

            {isVisible && (
                <div
                    className={`
                        absolute z-50 px-3 py-2 text-sm font-medium text-light-1 
                        bg-dark-1 rounded-md whitespace-nowrap pointer-events-none
                        border border-dark-3 ${positionClasses[position]}
                    `}
                >
                    {content}
                    <div
                        className={`
                            absolute w-0 h-0 border-4 border-transparent
                            ${arrowClasses[position]}
                        `}
                    />
                </div>
            )}
        </div>
    );
}
