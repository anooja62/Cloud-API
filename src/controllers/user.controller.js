import Joi from "joi";
import { loginUser } from "../services/user.service.js";

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    sso_id: Joi.string().required(),
    username: Joi.string().required(),
    image: Joi.string().uri().required(),
});

export const login = async (req, res) => {
    try {
        // Validate request body
        const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({ error: error.details.map(err => err.message) });
        }

        // Extract validated values
        const { email, sso_id, username, image } = value;

        // Call service function
        const { token, user } = await loginUser(email, sso_id, username, image);

        res.status(200).json({ message: "Login successful", token, user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
