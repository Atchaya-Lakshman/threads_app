'use client'

import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {usePathname, useRouter} from "next/navigation";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {CommentValidation} from "@/lib/validations/thread";
import {addCommentToThread} from "@/lib/actions/thread.actions";
import Image from "next/image";
import {z} from "zod";

interface Props {
    threadId: string,
    currentUserImg?: string | undefined,
    currentUserId: string
}

const Comment = ({threadId, currentUserImg, currentUserId}: Props) => {
    useRouter();
    const pathName = usePathname()

    const form = useForm({
        resolver: zodResolver(CommentValidation),
        defaultValues: {
            thread: ''
        }
    });

    const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
        
        await addCommentToThread(
            threadId, values.thread, JSON.parse(currentUserId), pathName,
        );

        form.reset();
    }

    return (
        <Form {...form}>
            <form
                className='comment-form flex items-center gap-3'
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <FormField
                    control={form.control}
                    name='thread'
                    render={({ field }) => (
                        <FormItem className='flex w-full items-center gap-3'>
                            <FormLabel>
                                <Image
                                    src={currentUserImg || '/assets/user.svg'}
                                    alt='current_user'
                                    width={48}
                                    height={48}
                                    className='rounded-full object-cover'
                                />
                            </FormLabel>
                            <FormControl className="border-none bg-transparent">
                                <Input
                                    type="text"
                                    placeholder="Comment..."
                                    className="no-focus text-light-1 outline-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <Button type='submit' className='comment-form_btn'
                        onClick={() => {}}>
                    Reply
                </Button>
            </form>
        </Form>
    )
}

export default Comment;