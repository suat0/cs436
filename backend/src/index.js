const express = require('express');
const cookieParser = require('cookie-parser');  
const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/dashboard', protectedRoutes);

app.listen(3000, () =>{
    console.log('Server is running on port 3000');
}   
);