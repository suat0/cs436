const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../config"); 
const rateLimit = require("express-rate-limit");


const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Allow only 5 login attempts per IP
    message: { error: "Too many failed login attempts. Please try again later." },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable X-RateLimit headers (use standard headers instead)
});
router.post("/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        //console.log("Request Body:", req.body); 

        if (!username || !email || !password) {
            return res.status(400).json({ error: "Username, email, and password are required!" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format. Please enter a valid email address." });
        }
        const [existingUser] = await db.query("SELECT * FROM users WHERE email = ? OR username = ?", [email, username]);

        if (existingUser.length > 0) {
            return res.status(400).json({ error: "User with this email or username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, hashedPassword]);

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error(" Registration Error:", error);
        res.status(500).json({ error: "Error registering user" });
    }
});

router.post("/login", loginLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;
        //console.log("Received auth login data:", req.body);

        const [users] = await db.query("SELECT * FROM users WHERE username = ?", [username]);

        if (users.length === 0) {
            return res.status(404).json({ error: "User not found. Please check your username." });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Incorrect password. Please try again." });
        }

        res.status(200).json({ message: "Login successful", username: user.username });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Error logging in" });
    }
});




module.exports = router;
