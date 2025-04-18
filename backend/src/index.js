const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors"); 
const orderRoutes = require('./routes/orders');


const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const categoryRoutes = require("./routes/category");
const cartRoutes = require("./routes/cart");
const checkoutRoutes = require('./routes/checkout');
const paymentRoutes = require('./routes/payment');
const session = require("express-session");

const authenticate = require('./middleware/authMiddleware');
const invoiceRoutes = require('./routes/invoice');



// Register payment API route
dotenv.config();
const app = express();

app.use(cors({
    origin: "http://localhost:3000", // Allow all origins temporarily (change in production)

    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: process.env.SESSION_SECRET || "your_secret_key", resave: false, saveUninitialized: true, cookie: {
    secure: false, // true in production with HTTPS
    httpOnly: true,
    sameSite: 'lax' // or 'none' with HTTPS
  }}));

app.use("/auth", authRoutes);
app.use('/api/orders', orderRoutes);

//app.use(authenticate);
app.use('/api/payment', paymentRoutes);

app.use('/api/checkout', checkoutRoutes);

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/invoices', invoiceRoutes);

// Serve React frontend
app.use(express.static(path.join(__dirname, "../../frontend/build")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/build", "index.html"));
});
// Test route to verify token
app.get('/api/test-token', authenticate, (req, res) => {
    res.json({ message: `Token is valid! User: ${req.user.username}` });
  });
  
// Use port 5001 from login system, or change if needed
const port = 5001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
