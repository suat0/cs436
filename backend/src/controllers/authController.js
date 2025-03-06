const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {createUser,findUser} = require('../models/User');

const generateToken = (user) =>{
    return jwt.sign({username: user.username}, process.env.JWT_SECRET,{
        expiresIn : process.env.JWT_EXPIRES_IN || '1h',
    });
};

exports.register = async (req,res) =>{
    const {username, password} = req.body;

    if (findUser(username)){
        return res.status(400).json({error: 'User already exists'}); 
    }

    try{
        const user = await createUser(username, password);
        const token = generateToken(user);
        res.status(201).json({ message: 'User registered successfully', user });
    } catch(err){
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }

};  

exports.login = async (req,res) =>{
    const {username, password} = req.body;
    const user = findUser(username);

    if (!user || !(await bcrypt.compare(password, user.password))){
        return res.status(401).json({error: 'Invalid username or password'});
    }
    const token = generateToken(user);
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000,
    })

    res.json({message: 'User logged in successfully', user});
}

