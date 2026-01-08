import mongoose, { Schema, Document } from "mongoose";

export interface PendingUser extends Document {
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpires: Date;
    createdAt: Date;
}

const PendingUserSchema: Schema<PendingUser> = new Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        match: [/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g, 'Please enter a valid email address'],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    verifyCode: {
        type: String,
        required: [true, "Verification code is required"],
    },
    verifyCodeExpires: {
        type: Date,
        required: [true, "Expiry date is required"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600, // Document will be automatically deleted after 10 minutes (600 seconds)
    },
});

const PendingUserModal = (mongoose.models.PendingUser as mongoose.Model<PendingUser>) || mongoose.model<PendingUser>("PendingUser", PendingUserSchema);

export default PendingUserModal;
