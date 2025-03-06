const bcrypt = require("bcryptjs");

const users=[];

const createUser = async (username, password) =>{
    const hashedPassword = await bcrypt.hash(password,10);
    const user = {username, password: hashedPassword};
    users.push(user);
    return user;
} ; 

const findUser = async (username) =>{
    return users.find(user => user.username === username);
}

module.exports = {createUser, findUser};