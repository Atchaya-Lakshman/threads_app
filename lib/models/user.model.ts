import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
    id: string;
    username: string;
    name: string;
    image?: string;
    bio?: string;
    threads: mongoose.Types.ObjectId[];
    onboarded: boolean;
    communities: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        id: {
            type: String,
            required: [true, "User ID is required"],
            unique: true,
        },
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            lowercase: true,
            trim: true,
            minlength: [3, "Username must be at least 3 characters"],
        },
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        image: {
            type: String,
            default: null,
        },
        bio: {
            type: String,
            default: null,
            maxlength: [500, "Bio cannot exceed 500 characters"],
        },
        threads: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Thread",
            },
        ],
        onboarded: {
            type: Boolean,
            default: false,
        },
        communities: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Community",
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
// Note: unique: true automatically creates an index, so no need to add it separately
userSchema.index({ createdAt: -1 });

const User =
    mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;