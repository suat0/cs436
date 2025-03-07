 // ✅ MySQL connection
 const authRoutes = require("./routes/auth");
 
const express = require("express");
const path = require("path");
const collection = require("./config");
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());  
app.use(express.urlencoded({ extended: true })); 
app.use("/auth", authRoutes);

app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});


const port = 5001;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
});