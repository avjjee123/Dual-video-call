import User from "../models/User.model.js"; 
import { Meeting } from "../models/Meeting.model.js";
import httpStatus from "http-status"; 
import bcrypt from "bcrypt"; 
import crypto from "crypto"; 

const register =async (req,res)=>{ 
    const {name,username,password}=req.body;
   
    if (!name || !username || !password) {
    return res.status(400).json({ message: "All fields required" });
     }
     
    try{
        const existingUser=await User.findOne({username});
        if(existingUser)
        {
            return res.status(409).json({message:"User already exists"});
        }
        const newUser=await User.create(req.body);
        const token=crypto.randomBytes(20).toString("hex");
        newUser.token=token; 
           await newUser.save();
        res.status(201).json({message:"User Created",success:true,newUser,token});  
    }catch(err) 
    {
         res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
         message: `Something went wrong ${err.message}`
        });  
    } 
}

const login =async (req,res)=>{
    const {username,password}=req.body;
    
    if(!username || !password)
    {
        return res.status(400).json({message:"Provide detail"}); 
    } 
    try{
         const user =await User.findOne({username});
         if(!user)
         {
            return res.status(httpStatus.NOT_FOUND).json({message:"not found username correct"});
         }
         console.log(user.password); 
         const detail=await bcrypt.compare(password,user.password);
         if(!detail)
         {
            return res.status(httpStatus.UNAUTHORIZED).json({message:"password incorrect"});
         }
         let token=user.token; 
        res.status(httpStatus.OK).json({message:"User login",token,user});  


    }catch(err)
    {
        res.json({message:`something went wrong ${err.message}`});   
    } 
}

const getUserHistory =async (req,res)=>{
    const {Token}=req.body; 
    try{
        const user=await User.findOne({token:Token})
        const meetings =await Meeting.find({user_id:user.username})
        res.json(meetings);   
    } catch(e){
        res.json({message:`Something went wrong ${e}`})
    } 
}

const addToHistory =async (req,res)=>{
    const {Token,meeting_code}=req.body;

    try{
        const user=await User.findOne({token:Token})
        const newMeeting=new Meeting({
            user_id:user.username,
            meetingCode:meeting_code
        })
        await newMeeting.save(); 
        res.status(httpStatus.CREATED).json({message:"added "},user);
    }catch(e){
        res.json({message:`Something went wrong ${e}`}) 
        console.log(e); 
    }
}

export {login,register,getUserHistory,addToHistory}; 