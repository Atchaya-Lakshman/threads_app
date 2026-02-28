/**
 * Application-wide constants
 * Centralized configuration for better maintainability
 */

// ============= Navigation =============
export const SIDEBAR_LINKS = [
    {
        imgURL: "/assets/home.svg",
        route: "/",
        label: "Home",
    },
    {
        imgURL: "/assets/search.svg",
        route: "/search",
        label: "Search",
    },
    {
        imgURL: "/assets/heart.svg",
        route: "/activity",
        label: "Activity",
    },
    {
        imgURL: "/assets/create.svg",
        route: "/create-thread",
        label: "Create Thread",
    },
    {
        imgURL: "/assets/community.svg",
        route: "/communities",
        label: "Communities",
    },
    {
        imgURL: "/assets/user.svg",
        route: "/profile",
        label: "Profile",
    },
] as const;

// ============= Tabs =============
export const PROFILE_TABS = [
    { value: "threads", label: "Threads", icon: "/assets/reply.svg" },
    { value: "replies", label: "Replies", icon: "/assets/members.svg" },
    { value: "tagged", label: "Tagged", icon: "/assets/tag.svg" },
] as const;

export const COMMUNITY_TABS = [
    { value: "threads", label: "Threads", icon: "/assets/reply.svg" },
    { value: "members", label: "Members", icon: "/assets/members.svg" },
    { value: "requests", label: "Requests", icon: "/assets/request.svg" },
] as const;

// ============= Pagination =============
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 20,
    MIN_PAGE_SIZE: 1,
    MAX_PAGE_SIZE: 100,
} as const;

// ============= Validation =============
export const VALIDATION = {
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 30,
    BIO_MAX_LENGTH: 500,
    THREAD_MAX_LENGTH: 5000,
    THREAD_MIN_LENGTH: 1,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
} as const;

// ============= Image =============
export const IMAGE_CONFIG = {
    SUPPORTED_FORMATS: ["image/png", "image/jpeg", "image/gif", "image/webp"],
    SUPPORTED_EXTENSIONS: [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

// ============= Routes =============
export const ROUTES = {
    HOME: "/",
    SEARCH: "/search",
    ACTIVITY: "/activity",
    CREATE_THREAD: "/create-thread",
    COMMUNITIES: "/communities",
    PROFILE: "/profile",
    PROFILE_EDIT: "/profile/edit",
    SIGN_IN: "/sign-in",
    SIGN_UP: "/sign-up",
    ONBOARDING: "/onboarding",
} as const;

// ============= API =============
export const API = {
    UPLOADTHING_MEDIA: "media",
    UPLOADTHING_MESSAGE_IMAGE: "messageImage",
} as const;

// ============= Error Messages =============
export const ERROR_MESSAGES = {
    UNAUTHORIZED: "You are not authorized to perform this action",
    NOT_FOUND: "Resource not found",
    INVALID_INPUT: "Invalid input provided",
    DATABASE_ERROR: "Database operation failed",
    UPLOAD_ERROR: "File upload failed",
    NETWORK_ERROR: "Network error occurred",
} as const;

// ============= Success Messages =============
export const SUCCESS_MESSAGES = {
    PROFILE_UPDATED: "Profile updated successfully",
    THREAD_CREATED: "Thread created successfully",
    THREAD_DELETED: "Thread deleted successfully",
    COMMUNITY_CREATED: "Community created successfully",
} as const;
