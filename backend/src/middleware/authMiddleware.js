const jwt = require('jsonwebtoken');

const isAuthenticated = (req,res,next) =>{
    const token = req.cookies.token;
    if (!token){
        return res.status(401).json({error: 'Unauthorized'});
    }
    try{
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user;
        next();
    } catch(err){
        console.error(err);
        res.status(403).json({error: 'Forbidden'});
    }
};
module.exports = isAuthenticated;
