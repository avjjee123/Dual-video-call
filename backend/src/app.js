import express from "express";
import {createServer} from "node:http";
import {Server} from "socket.io";
import mongoose from "mongoose"; 
import cors from "cors";

import Userrouter from "./routers/User.routes.js"; 
import { connectToSocket } from "./controllers/socketManager.js";
const port =process.env.PORT || 8000;  

const app=express();
app.use(cors({
    origin:"http://localhost:5173",   
    credentials:true,   
})); 
app.use(express.json({limit:"40kb"}));  
app.use(express.urlencoded({limit:"40kb", extended:true})); 

const server = createServer(app);
const io=connectToSocket(server);   

mongoose.connect("mongodb+srv://jainaviral:avj%401104@videoconferme.ehkd0gj.mongodb.net/?appName=videoConferMe")
.then(()=>console.log("mongoose connnected"))
.catch((err)=>console.log(err.message)); 

app.set("port",port);  
server.listen(app.get('port'),()=>{  
    console.log("Listen On port 8000")
});

// app.get("/home",async(req,res)=>{
//     res.json("hello everyone"); 
// })

app.use("/api/v1/users",Userrouter); 
