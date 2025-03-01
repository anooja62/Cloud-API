import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import File from "../models/file.model.js";
import dotenv from "dotenv";
import { Readable } from "stream";

dotenv.config();

// Initialize S3 Client
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Upload file to S3
export const uploadFile = async (user, file, folder = "") => {
    const key = `${folder}${file.originalname}`;

    const params = {
        Bucket: user.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
    };

    await s3.send(new PutObjectCommand(params));


    // Save file details including size and MIME type
    const newFile = await File.create({
        file_name: file.originalname,
        user_id: user._id,
        key,
        folder,
        mime_type: file.mimetype, // Store MIME type
        size: file.size, // Store file size
        created_at: new Date(),
        updated_at: new Date(),
    });

    return newFile;
};

//  List all folders in user's S3 bucket
export const listFolders = async (user) => {
    const params = { Bucket: user.bucketName, Delimiter: "/" };
    const data = await s3.send(new ListObjectsV2Command(params));

    return data.CommonPrefixes?.map(prefix => prefix.Prefix) || [];
};


const formatFileSize = (size) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

export const listFiles = async (user, folder = "", expiry = 36000) => {
    try {
        const params = { Bucket: user.bucketName, Prefix: folder };
        const data = await s3.send(new ListObjectsV2Command(params));

        if (!data.Contents) return [];

        const files = await Promise.all(
            data.Contents.map(async (file) => {
                const dbFile = await File.findOne({ key: file.Key, user_id: user._id });

                const signedUrl = await getSignedUrl(
                    s3,
                    new GetObjectCommand({
                        Bucket: user.bucketName,
                        Key: file.Key,
                    }),
                    { expiresIn: expiry }
                );

                return {
                    _id: dbFile ? dbFile._id.toString() : null,
                    file_name: dbFile ? dbFile.file_name : null,
                    key: file.Key,
                    url: signedUrl,
                    size: dbFile?.size || file.Size,
                    sizeFormatted: formatFileSize(dbFile?.size || file.Size),
                    mime_type: dbFile?.mime_type || "unknown",
                    created_at: dbFile?.created_at || new Date(0), // Use old date if missing
                };
            })
        );

        // Sort in descending order by created_at
        return files.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (error) {
        console.error("Error listing files:", error);
        throw new Error("Failed to list files");
    }
};

//  Get a file from S3
export const getFile = async (user, key) => {
    const params = { Bucket: user.bucketName, Key: key };
    const { Body } = await s3.send(new GetObjectCommand(params));

    // Convert AWS response to a readable stream
    return Body instanceof Readable ? Body : Readable.from(Body);
};

// Delete a file from S3
export const deleteFile = async (user, key) => {
    const params = { Bucket: user.bucketName, Key: key };
    await s3.send(new DeleteObjectCommand(params));

    await File.findOneAndDelete({ key });
    return "File deleted successfully";
};
