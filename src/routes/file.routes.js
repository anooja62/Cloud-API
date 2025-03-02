import express from "express";
import multer from "multer";
import { upload, getFolders, getFiles, downloadFile, removeFile } from "../controllers/file.controller.js";

const router = express.Router();
const uploadMiddleware = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 512 * 512 * 512 },
});


router.get("/", getFiles);
router.post("/upload", uploadMiddleware.array("file", 5), upload);
//un-used
router.get("/folders", getFolders);
router.get("/:key", downloadFile);
router.delete("/:key", removeFile);

export default router;
