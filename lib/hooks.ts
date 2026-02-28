/**
 * Custom React Hooks for common patterns
 * Provides reusable state and logic management
 */

import { useCallback, useEffect, useState } from "react";

// ============= useImageUpload Hook =============

interface UseImageUploadOptions {
    onUploadStart?: () => void;
    onUploadSuccess?: (imageUrl: string) => void;
    onUploadError?: (error: Error) => void;
}

export function useImageUpload(options?: UseImageUploadOptions) {
    const [files, setFiles] = useState<File[]>([]);
    const [preview, setPreview] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const handleImageChange = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            setError(null);

            if (!e.target.files || e.target.files.length === 0) return;

            const file = e.target.files[0];

            // Validate file type
            if (!file.type.startsWith("image/")) {
                setError(new Error("Please select a valid image file"));
                return;
            }

            setFiles(Array.from(e.target.files));

            // Create preview
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreview((event.target?.result as string) || "");
            };
            reader.readAsDataURL(file);
        },
        []
    );

    const clearImage = useCallback(() => {
        setFiles([]);
        setPreview("");
        setError(null);
    }, []);

    return {
        files,
        preview,
        isLoading,
        error,
        handleImageChange,
        clearImage,
    };
}

// ============= usePagination Hook =============

interface UsePaginationOptions {
    initialPage?: number;
    pageSize?: number;
}

export function usePagination(options?: UsePaginationOptions) {
    const { initialPage = 1, pageSize = 20 } = options || {};

    const [pageNumber, setPageNumber] = useState(initialPage);
    const [isNext, setIsNext] = useState(false);

    const goToPage = useCallback((page: number) => {
        setPageNumber(Math.max(1, page));
    }, []);

    const nextPage = useCallback(() => {
        setPageNumber((prev) => prev + 1);
    }, []);

    const prevPage = useCallback(() => {
        setPageNumber((prev) => Math.max(1, prev - 1));
    }, []);

    return {
        pageNumber,
        pageSize,
        isNext,
        setIsNext,
        goToPage,
        nextPage,
        prevPage,
    };
}

// ============= useDebounce Hook =============

export function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

// ============= useAsync Hook =============

interface UseAsyncState<T> {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
}

export function useAsync<T>(
    asyncFunction: () => Promise<T>,
    immediate: boolean = true
): UseAsyncState<T> & { execute: () => Promise<void> } {
    const [state, setState] = useState<UseAsyncState<T>>({
        data: null,
        isLoading: false,
        error: null,
    });

    const execute = useCallback(async () => {
        setState({ data: null, isLoading: true, error: null });
        try {
            const response = await asyncFunction();
            setState({ data: response, isLoading: false, error: null });
        } catch (error) {
            setState({
                data: null,
                isLoading: false,
                error: error instanceof Error ? error : new Error("Unknown error"),
            });
        }
    }, [asyncFunction]);

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [execute, immediate]);

    return { ...state, execute };
}

// ============= useLocalStorage Hook =============

export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            if (typeof window === "undefined") return initialValue;
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = useCallback(
        (value: T) => {
            try {
                setStoredValue(value);
                if (typeof window !== "undefined") {
                    window.localStorage.setItem(key, JSON.stringify(value));
                }
            } catch (error) {
                console.error(`Error setting localStorage key "${key}":`, error);
            }
        },
        [key]
    );

    return [storedValue, setValue];
}

// ============= useRouteChangeDetection Hook =============

export function useRouteChangeDetection(
    callback: (newPath: string) => void
) {
    useEffect(() => {
        const handleRouteChange = () => {
            callback(window.location.pathname);
        };

        window.addEventListener("popstate", handleRouteChange);
        return () => {
            window.removeEventListener("popstate", handleRouteChange);
        };
    }, [callback]);
}
