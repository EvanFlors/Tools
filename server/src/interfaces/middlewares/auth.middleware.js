import { verifyAccessToken } from "../../config/jwt.js";

const authenticate = (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = verifyAccessToken(token);

        if (!decoded) return res.status(401).json({ message: "Unauthorized" });

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

export default authenticate;