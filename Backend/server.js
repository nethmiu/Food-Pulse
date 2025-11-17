require('dotenv').config();
const express =  require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

//routes



//connect to mongodb
mongoose.connect(process.env.MONGO_URI)
.then(()=> app.listen(process.env.PORT || 5000, ()=>{
    console.log("Server is running on port 5000");
    console.log("Mongodb connected!!!!");
}))


.catch((err)=> console.log(err));