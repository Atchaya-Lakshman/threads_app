'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { UserValidation } from "@/lib/validations/user";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import * as z from "zod";
import Image from "next/image";
import React, { useState, useCallback } from "react";
import { isBase64Image } from "@/lib/utils";
import { useUploadThing } from "@/lib/uploadThing";
import { updateUser } from "@/lib/actions/user.actions";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";

// ============= Type Definitions =============

interface AccountProfileProps {
    user: {
        id: string;
        objectId: string;
        username: string;
        name: string;
        bio: string;
        image: string;
    };
    btnTitle: string;
}

// ============= Component =============

/**
 * AccountProfile Component
 * Handles user profile creation and editing with image upload support
 * Features:
 * - Profile photo upload with preview
 * - Form validation with Zod
 * - Image compression and upload to UploadThing
 * - Automatic cache revalidation
 */
const AccountProfile = ({ user, btnTitle }: AccountProfileProps) => {
    const [files, setFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const { startUpload } = useUploadThing("media");
    const router = useRouter();
    const pathName = usePathname();

    const form = useForm<z.infer<typeof UserValidation>>({
        resolver: zodResolver(UserValidation),
        defaultValues: {
            profile_photo: user.image || "",
            name: user.name || "",
            username: user.username || "",
            bio: user.bio || "",
        },
    });

    /**
     * Handle image selection and preview
     * Validates file type before processing
     */
    const handleImage = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>, fieldChange: (value: string) => void) => {
            e.preventDefault();
            setUploadError(null);

            if (!e.target.files || e.target.files.length === 0) return;

            const file = e.target.files[0];

            // Validate file type
            if (!file.type.includes("image")) {
                setUploadError("Please select a valid image file");
                return;
            }

            setFiles(Array.from(e.target.files));

            // Create preview
            const fileReader = new FileReader();
            fileReader.onload = (event) => {
                const imageDataUrl = (event.target?.result as string) || '';
                fieldChange(imageDataUrl);
            };
            fileReader.readAsDataURL(file);
        },
        []
    );

    /**
     * Handle form submission
     * Uploads image if changed and updates user profile
     */
    const onSubmit = async (values: z.infer<typeof UserValidation>) => {
        setIsSubmitting(true);
        setUploadError(null);

        try {
            let imageUrl = values.profile_photo;

            // Upload image if it has changed
            if (isBase64Image(values.profile_photo)) {
                const uploadResult = await startUpload(files);

                if (!uploadResult || !uploadResult[0]) {
                    setUploadError("Failed to upload image. Please try again.");
                    setIsSubmitting(false);
                    return;
                }

                imageUrl = uploadResult[0].ufsUrl;
            }

            // Update user profile
            await updateUser({
                userId: user.id,
                username: values.username,
                name: values.name,
                bio: values.bio,
                image: imageUrl,
                path: pathName,
            });

            // Navigate back or to home
            if (pathName === ROUTES.PROFILE_EDIT) {
                router.back();
            } else {
                router.push(ROUTES.HOME);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An error occurred";
            setUploadError(errorMessage);
            console.error("Profile update error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-xl rounded-2xl bg-[linear-gradient(180deg,#1a1a1a_0%,#242424_100%)] p-8 border border-white/25 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
            {uploadError && (
                <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                    {uploadError}
                </div>
            )}

            <Form {...form}>
                <form
                    className="flex flex-col justify-start gap-10"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    {/* Profile Photo Field */}
                    <FormField
                        control={form.control}
                        name="profile_photo"
                        render={({ field }) => (
                            <FormItem className="flex items-center gap-4">
                                <FormLabel className="account-form_image-label">
                                    {field.value ? (
                                        <Image
                                            src={field.value}
                                            alt="Profile preview"
                                            width={96}
                                            height={96}
                                            priority
                                            className="rounded-full object-cover"
                                        />
                                    ) : (
                                        <Image
                                            src="/assets/profile.svg"
                                            alt="Profile placeholder"
                                            width={24}
                                            height={24}
                                            className="object-contain"
                                        />
                                    )}
                                </FormLabel>
                                <FormControl className="flex-1 text-base-semibold text-gray-200">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        className="account-form_image-input"
                                        onChange={(e) => handleImage(e, field.onChange)}
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Name Field */}
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="flex flex-col w-full gap-3">
                                <FormLabel className="text-base-semibold text-light-2">
                                    Name
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        className="account-form_input no-focus"
                                        placeholder="Enter your full name"
                                        disabled={isSubmitting}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Username Field */}
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem className="flex flex-col w-full gap-3">
                                <FormLabel className="text-base-semibold text-light-2">
                                    Username
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        className="account-form_input no-focus"
                                        placeholder="Enter your username"
                                        disabled={isSubmitting}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Bio Field */}
                    <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                            <FormItem className="flex flex-col w-full gap-3">
                                <FormLabel className="text-base-semibold text-light-2">
                                    Bio
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        rows={10}
                                        className="account-form_input no-focus"
                                        placeholder="Write a brief bio about yourself"
                                        disabled={isSubmitting}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Updating..." : btnTitle}
                    </Button>
                </form>
            </Form>
        </div>
    );
};

export default AccountProfile;