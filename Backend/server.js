const userRoutes = require('./routes/userRoutes');
const menuRoutes = require('./routes/menuRoutes');
const path = require('path');
require('dotenv').config();
const express =  require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);



//connect to mongodb
mongoose.connect(process.env.MONGO_URI)
.then(()=> app.listen(process.env.PORT || 5000, ()=>{
    console.log("Server is running on port 5000");
    console.log("Mongodb connected!!!!");
}))


.catch((err)=> console.log(err));