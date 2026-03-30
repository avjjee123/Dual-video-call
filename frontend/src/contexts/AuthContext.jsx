import {useContext, useState,createContext } from "react";
import { useNavigate } from "react-router-dom";
import httpStatus from "http-status";  
import axios from "axios";


export const AuthContext = createContext({});

const client = axios.create({
    baseURL:"http://localhost:8000/api/v1/users",
    withCredentials:true,
}) 
  
export const AuthProvider = ({children})=>{

    const authContext =useContext(AuthContext); 

    const [userData,setUserData]=useState(authContext); //
     const router=useNavigate();
    
   const handleRegister=async(name,username,password)=>{
    try{
        let request =await client.post("/register",{
         name:name,
         username:username,
         password:password 
        })
console.log(request);  
 localStorage.setItem("token",request.data.token); 
        if(request.status===httpStatus.CREATED){
            return request.data.message; 
        }
    } catch(err){
        if (err.response) {
      return err.response.data.message;
    }
    return "Server error";
    }
   }
   

   const handleLogin =async(username,password)=>{
    try{
        let request =await client.post("/login",{
            username:username,
            password:password 
        })  
        if(request.status===httpStatus.OK){ 
            localStorage.setItem("token",request.data.token); 
            console.log(request.data); 
            return request.data.message;
        }
    }catch(err)
    { 
       if (err.response) {
      return err.response.data.message;
    }
    return "Server error";
    }
   }
   

   const getUserHistory=async ()=>{
    try{
        let request=await client.post("/get_all_activity",{
            Token:localStorage.getItem("token")
        })
         console.log(request.data);  
        return request.data; 
    }catch(e){
        return e.message;
        console.log(e); 
    }
   }

   const addUserHistory =async(meetingCode)=>{
    try{  
        let request = await client.post('/add_to_activity',{
            Token:localStorage.getItem("token"),
            meeting_code:meetingCode
        })
          console.log("get answer");
          console.log(request.data);    
        return request.data.message;  
    }catch(e){
        console.log("get errorss");
         return e.message; 
    }
   }

   
    const data={
        userData,setUserData,handleRegister,handleLogin 
        ,getUserHistory,addUserHistory
    }

    return(
        <AuthContext.Provider value={data}>
            {children}  
        </AuthContext.Provider>
    )
}