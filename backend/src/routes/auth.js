const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../config"); 

const router = express.Router();

router.post("/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log("Request Body:", req.body); 

        if (!username || !email || !password) {
            return res.status(400).json({ error: "Username, email, and password are required!" });
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

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log("Received auth login data:", req.body); 
        const [user] = await db.query("SELECT * FROM users WHERE username = ?", [username]);

        if (user.length === 0) {
            return res.status(400).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user[0].password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        res.render("home");

    } catch (error) {
        console.error(" Login Error:", error);
        res.status(500).json({ error: "Error logging in" });
    }
});

module.exports = router;
