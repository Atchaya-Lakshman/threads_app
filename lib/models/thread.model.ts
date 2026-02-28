import mongoose, { Document, Schema } from "mongoose";

interface IThread extends Document {
    text: string;
    author: mongoose.Types.ObjectId;
    community?: mongoose.Types.ObjectId;
    parentId?: string;
    children: mongoose.Types.ObjectId[];
    likes: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const threadSchema = new Schema<IThread>(
    {
        text: {
            type: String,
            required: [true, "Thread content is required"],
            trim: true,
            minlength: [1, "Thread cannot be empty"],
            maxlength: [5000, "Thread cannot exceed 5000 characters"],
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Author is required"],
        },
        community: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Community",
            default: null,
        },
        parentId: {
            type: String,
            default: null,
        },
        children: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Thread",
            },
        ],
        likes: [
            {
                type: String,  // Store Clerk user IDs as strings
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
threadSchema.index({ author: 1, createdAt: -1 });
threadSchema.index({ community: 1 });
threadSchema.index({ text: 'text' }); // For full-text search
threadSchema.index({ parentId: 1 });
threadSchema.index({ createdAt: -1 });
threadSchema.index({ likes: 1 });

const Thread =
    mongoose.models.Thread ||
    mongoose.model<IThread>("Thread", threadSchema);

export default Thread;