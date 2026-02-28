/**
 * Environment variable validation and configuration
 * Ensures all required environment variables are set and valid
 */

/**
 * Environment variable schema
 */
interface EnvironmentConfig {
    MONGODB_URL: string;
    CLERK_SECRET_KEY: string;
    UPLOADTHING_SECRET: string;
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
}

/**
 * Validate that all required environment variables are set
 * Throws an error if any required variable is missing
 * This runs at build/startup time
 */
export function validateEnvironment(): EnvironmentConfig {
    const requiredVars = [
        "MONGODB_URL",
        "CLERK_SECRET_KEY",
        "UPLOADTHING_SECRET",
        "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    ] as const;

    const missingVars: string[] = [];

    for (const varName of requiredVars) {
        if (!process.env[varName]) {
            missingVars.push(varName);
        }
    }

    if (missingVars.length > 0) {
        const missingList = missingVars.join(", ");
        throw new Error(
            `Missing required environment variables: ${missingList}\n` +
            `Please configure these in your .env.local file.`
        );
    }

    return {
        MONGODB_URL: process.env.MONGODB_URL!,
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY!,
        UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET!,
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
            process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
    };
}

/**
 * Get a single environment variable with validation
 */
export function getEnvVar(
    name: string,
    defaultValue?: string
): string {
    const value = process.env[name];

    if (!value) {
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        throw new Error(
            `Environment variable "${name}" is required but not set.`
        );
    }

    return value;
}

/**
 * Check if running in development mode
 */
export const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Check if running in production mode
 */
export const isProduction = process.env.NODE_ENV === "production";

/**
 * Check if running in test mode
 */
export const isTesting = process.env.NODE_ENV === "test";

/**
 * Get the app URL based on environment
 */
export function getAppUrl(): string {
    if (isDevelopment) {
        return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    }
    return process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com";
}
