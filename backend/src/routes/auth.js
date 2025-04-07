const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../controllers/db"); 
const rateLimit = require("express-rate-limit");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many failed login attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/signup", async (req, res) => {
  try {
    const { Name, Email, Password } = req.body;
    if (!Name || !Email || !Password) {
      return res.status(400).json({ error: "Name, Email, and Password are required!" });
    }

    const EmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!EmailRegex.test(Email)) {
      return res.status(400).json({ error: "Invalid Email format." });
    }

    const [existingUser] = await db.query(
      "SELECT * FROM Users WHERE Email = ? OR Name = ?",
      [Email, Name]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);

    await db.query(
      "INSERT INTO Users (Name, Email, Password) VALUES (?, ?, ?)",
      [Name, Email, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Error registering user" });
  }
});

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { Name, Password } = req.body;
    const [Users] = await db.query("SELECT * FROM Users WHERE Name = ?", [Name]);

    if (Users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = Users[0];
    const isMatch = await bcrypt.compare(Password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect Password" });
    }

    const token = jwt.sign({ id: user.id, Name: user.Name }, process.env.JWT_SECRET || "your_secret_key", {
      expiresIn: "1h"
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 3600000
    });

    res.status(200).json({ message: "Login successful", Name: user.Name });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Error logging in" });
  }
});

// ✅ NEW: /auth/status route for frontend login check
router.get("/status", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(200).json({ loggedIn: false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
    res.json({ loggedIn: true, user: decoded });
  } catch (err) {
    res.status(200).json({ loggedIn: false });
  }
});

router.post("/logout", (req, res) => {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "None", // or "Lax" depending on your setup
      secure: false,    // set to true if using HTTPS
    });
    return res.status(200).json({ message: "Logout successful" });
  });
  
module.exports = router;
