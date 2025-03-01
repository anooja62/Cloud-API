import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import s3 from "../config/s3.js";
import dotenv from "dotenv";
import { CreateBucketCommand } from "@aws-sdk/client-s3";



dotenv.config();


const generateToken = (user) => {
    return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Create S3 bucket for a user
export const createUserBucket = async (bucketName) => {
    try {
        await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
        return `Bucket ${bucketName} created`;
    } catch (error) {
        if (error.name === "BucketAlreadyOwnedByYou") return `Bucket ${bucketName} already exists`;
        throw error;
    }
};


export const loginUser = async (email, sso_id, username, image) => {

    let user = await User.findOne({ email });

    if (!user) {
        // Create a new user if not exists
        const bucketName = `user-${Date.now()}`;
        await createUserBucket(bucketName);

        user = new User({ sso_id, username, email, image, bucketName });
        await user.save();
    } else {
        // Validate SSO ID
        if (user.sso_id !== sso_id) {
            throw new Error("Failed to login:Invalid SSO ID");
        }
    }

    const token = generateToken(user);
    return { user: { ...user.toObject(), token } };
};

