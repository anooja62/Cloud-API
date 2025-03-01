import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    file_name: { type: String, ref: "User", required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    key: { type: String, required: true },
    folder: { type: String, default: "" },
    mime_type: { type: String, default: "" },
    size: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

fileSchema.pre("save", function (next) {
    this.updated_at = new Date();
    next();
});
const File = mongoose.model("File", fileSchema);
export default File;
