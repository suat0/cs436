const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../controllers/db"); 
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
        const { Name, Email, Password } = req.body;
        console.log("Request Body:", req.body); 

        if (!Name || !Email || !Password) {
            return res.status(400).json({ error: "Name, Email, and Password are required!" });
        }

        const EmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!EmailRegex.test(Email)) {
            return res.status(400).json({ error: "Invalid Email format. Please enter a valid Email address." });
        }
        const [existingUser] = await db.query("SELECT * FROM Users WHERE Email = ? OR Name = ?", [Email, Name]);

        if (existingUser.length > 0) {
            return res.status(400).json({ error: "User with this Email or Name already exists" });
        }

        const hashedPassword = await bcrypt.hash(Password, 10);

        await db.query("INSERT INTO Users (Name, Email, Password) VALUES (?, ?, ?)", [Name, Email, hashedPassword]);

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error(" Registration Error:", error);
        res.status(500).json({ error: "Error registering user" });
    }
});

const jwt = require("jsonwebtoken");

router.post("/login", loginLimiter, async (req, res) => {
    try {
        const { Name, Password } = req.body;
        const [Users] = await db.query("SELECT * FROM Users WHERE Name = ?", [Name]);

        if (Users.length === 0) {
            return res.status(404).json({ error: "User not found. Please check your Name." });
        }

        const user = Users[0];

        const isMatch = await bcrypt.compare(Password, user.Password);
        if (!isMatch) {
            return res.status(401).json({ error: "Incorrect Password. Please try again." });
        }

        const token = jwt.sign({ id: user.id, Name: user.Name }, "your_secret_key", { expiresIn: "1h" });

        res.cookie("token", token, {
            httpOnly: true, // Prevents JavaScript access to the cookie
            secure: false,  // Change to `true` in production with HTTPS
            maxAge: 3600000 // 1 hour
        });

        res.status(200).json({ message: "Login successful", Name: user.Name });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Error logging in" });
    }
});




module.exports = router;
