/**
 * API Response utilities and standardized error handling
 * Provides consistent response formats across all API routes
 */

import { NextResponse } from "next/server";

// ============= Type Definitions =============

export interface ApiResponse<T = null> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    timestamp: string;
}

export interface ApiError {
    success: false;
    message: string;
    error: string;
    timestamp: string;
}

export type ApiErrorCode =
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "VALIDATION_ERROR"
    | "INTERNAL_SERVER_ERROR"
    | "BAD_REQUEST"
    | "CONFLICT";

// ============= Error Status Mapping =============

const errorStatusMap: Record<ApiErrorCode, number> = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    VALIDATION_ERROR: 400,
    INTERNAL_SERVER_ERROR: 500,
    BAD_REQUEST: 400,
    CONFLICT: 409,
};

// ============= Response Builders =============

/**
 * Build a successful API response
 */
export function successResponse<T>(
    data: T,
    message: string = "Success"
): ApiResponse<T> {
    return {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Build an error API response
 */
export function errorResponse(
    message: string,
    error: string,
    code: ApiErrorCode = "INTERNAL_SERVER_ERROR"
): ApiError {
    return {
        success: false,
        message,
        error,
        timestamp: new Date().toISOString(),
    };
}

// ============= NextResponse Builders =============

/**
 * Create a successful NextResponse with JSON data
 */
export function okResponse<T>(
    data: T,
    message: string = "Success"
): NextResponse<ApiResponse<T>> {
    return NextResponse.json(successResponse(data, message), { status: 200 });
}

/**
 * Create a created NextResponse (201)
 */
export function createdResponse<T>(
    data: T,
    message: string = "Created"
): NextResponse<ApiResponse<T>> {
    return NextResponse.json(successResponse(data, message), { status: 201 });
}

/**
 * Create an error NextResponse
 */
export function errorResponseJson(
    statusCode: number,
    message: string,
    error: string
): NextResponse<ApiError> {
    return NextResponse.json(errorResponse(message, error), {
        status: statusCode,
    });
}

/**
 * Create an error response based on error code
 */
export function codeErrorResponse(
    code: ApiErrorCode,
    message: string,
    error: string
): NextResponse<ApiError> {
    const statusCode = errorStatusMap[code];
    return errorResponseJson(statusCode, message, error);
}

/**
 * Handle validation errors
 */
export function validationErrorResponse(
    message: string,
    validationErrors: Record<string, string[]>
): NextResponse<
    ApiError & { validationErrors?: Record<string, string[]> }
> {
    const response: ApiError & { validationErrors?: Record<string, string[]> } = {
        success: false as const,
        message,
        error: "Validation failed",
        timestamp: new Date().toISOString(),
        validationErrors,
    };
    return NextResponse.json(response, { status: 400 });
}

/**
 * Handle not found errors
 */
export function notFoundResponse(
    resource: string = "Resource"
): NextResponse<ApiError> {
    return codeErrorResponse(
        "NOT_FOUND",
        `${resource} not found`,
        `The requested ${resource.toLowerCase()} does not exist`
    );
}

/**
 * Handle unauthorized errors
 */
export function unauthorizedResponse(
    message: string = "Unauthorized access"
): NextResponse<ApiError> {
    return codeErrorResponse(
        "UNAUTHORIZED",
        "Authentication required",
        message
    );
}

/**
 * Handle forbidden errors
 */
export function forbiddenResponse(
    message: string = "You do not have permission to perform this action"
): NextResponse<ApiError> {
    return codeErrorResponse("FORBIDDEN", "Access denied", message);
}

/**
 * Handle internal server errors
 */
export function internalErrorResponse(
    error?: Error
): NextResponse<ApiError> {
    const message = error?.message || "An unexpected error occurred";
    console.error("[API Error]", error);
    return codeErrorResponse(
        "INTERNAL_SERVER_ERROR",
        "Internal server error",
        message
    );
}

/**
 * Safely execute an async API handler with error handling
 */
export async function safeHandler<T>(
    handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T>> {
    try {
        return await handler();
    } catch (error) {
        console.error("[API Handler Error]", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return internalErrorResponse(
            error instanceof Error ? error : new Error(message)
        ) as NextResponse<T>;
    }
}

// ============= Middleware for API Routes =============

/**
 * Validate request method
 */
export function validateMethod(
    actualMethod: string,
    allowedMethods: string[]
): { valid: boolean; response?: NextResponse<ApiError> } {
    if (!allowedMethods.includes(actualMethod)) {
        return {
            valid: false,
            response: codeErrorResponse(
                "BAD_REQUEST",
                "Method not allowed",
                `Only ${allowedMethods.join(", ")} methods are allowed`
            ),
        };
    }
    return { valid: true };
}

/**
 * Parse and validate JSON request body
 */
export async function parseJsonBody<T>(
    request: Request
): Promise<{ data?: T; error?: NextResponse<ApiError> }> {
    try {
        const data = await request.json();
        return { data: data as T };
    } catch (error) {
        return {
            error: codeErrorResponse(
                "BAD_REQUEST",
                "Invalid JSON",
                "Request body must be valid JSON"
            ),
        };
    }
}
