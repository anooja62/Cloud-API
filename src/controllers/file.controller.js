import { uploadFile, listFolders, listFiles, getFile, deleteFile } from "../services/file.services.js";

export const upload = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            throw new Error("File is required");
        }

        const folder = req.body.folder ? `${req.body.folder}/` : "";
        const uploadedFiles = await Promise.all(
            req.files.map(file => uploadFile(req.user, file, folder))
        );

        res.status(201).json({ message: "Files uploaded", files: uploadedFiles });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getFolders = async (req, res) => {
    try {
        const folders = await listFolders(req.user);
        res.status(200).json({ folders });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getFiles = async (req, res) => {
    try {
        const folder = req.query.folder ? `${req.query.folder}/` : "";
        const files = await listFiles(req.user, folder);

        res.status(200).json({ files });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const downloadFile = async (req, res) => {
    try {
        const { key } = req.params;
        const fileStream = await getFile(req.user, key);

        res.setHeader("Content-Disposition", `attachment; filename="${key.split("/").pop()}"`);
        fileStream.pipe(res);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const removeFile = async (req, res) => {
    try {
        const { key } = req.params;
        const message = await deleteFile(req.user, key);

        res.status(200).json({ message });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
