import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    sso_id: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String, required: true, unique: true },

    bucketName: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },

});
userSchema.pre("save", function (next) {
    this.updated_at = new Date();
    next();
});

const User = mongoose.model("User", userSchema);
export default User;
