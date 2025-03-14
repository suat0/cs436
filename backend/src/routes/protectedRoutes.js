const express = require('express');
const isAuthenticated = require('../middleware/authMiddleware');
const router = express.Router();
router.get('/dashboard', isAuthenticated, (req,res) =>{
    res.json({message: 'Welcome ${req.user.username}!'});
});
module.exports = router;