const db = require("../controllers/db");

const jwt = require("jsonwebtoken");
require("dotenv").config();

const isAuthenticated = async(req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, "your_secret_key");

        const [rows] = await db.query("SELECT * FROM Users WHERE id = ?", [decoded.id]);
        if (rows.length === 0) {
            return res.status(401).json({ error: "Unauthorized: User not found" });
        }

        req.user = rows[0]; // ✅ Attach full user including role

        next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
};

const checkAuthentication = (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        try {
            const decoded = jwt.verify(token, "your_secret_key");
           req.user = decoded; 
        } catch (error) {
            return res.status(401).json({ error: "Unauthorized: Invalid token" });
        }
    }

    next();
};

module.exports.isAuthenticated = isAuthenticated;
module.exports.checkAuthentication = checkAuthentication;
