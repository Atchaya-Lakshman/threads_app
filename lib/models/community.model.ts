import mongoose, { Document, Schema } from "mongoose";

interface ICommunity extends Document {
    id: string;
    username: string;
    name: string;
    image?: string;
    bio?: string;
    createdBy: mongoose.Types.ObjectId;
    threads: mongoose.Types.ObjectId[];
    members: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const communitySchema = new Schema<ICommunity>(
    {
        id: {
            type: String,
            required: [true, "Community ID is required"],
            unique: true,
        },
        username: {
            type: String,
            unique: true,
            required: [true, "Community username is required"],
            lowercase: true,
            trim: true,
        },
        name: {
            type: String,
            required: [true, "Community name is required"],
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
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Community creator is required"],
        },
        threads: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Thread",
            },
        ],
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
// Note: unique: true automatically creates an index, so no need to add it separately
communitySchema.index({ createdBy: 1 });
communitySchema.index({ createdAt: -1 });

const Community =
    mongoose.models.Community ||
    mongoose.model<ICommunity>("Community", communitySchema);

export default Community;