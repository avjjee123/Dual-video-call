import React, {useContext, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext';
import {ToastContainer,toast} from 'react-toastify'; 
import { useNavigate } from 'react-router-dom';

export default function Authentication() {
  const [namespace,setnamespace]=useState("");
  const [name,setname]=useState(""); 
  const [password,setpassword]=useState("");
  const [bollen,setbollen]=useState(false); 
  const navigate=useNavigate(); 
  const [message,setmessage]=useState(""); 
  
  const {handleRegister, handleLogin} =useContext(AuthContext);
  let handleAuth =async(e)=>{
    e.preventDefault();
    try{
         if(bollen)
         {  
            if(localStorage.token!=undefined){
                toast.error("YOU are allready Register");  
            }
            else{
               let result =await handleRegister(name,namespace,password);
            setmessage(result || "something happen");  
            toast.error(result); 
            console.log(result); 
            if(localStorage.token!=undefined){
               navigate("/");
            }
            }
            
         }
         else{
          if(localStorage.token!=undefined){
                toast.error("YOU are allready Login");   
            }
          else{
              let result =await handleLogin(namespace,password);
            toast.error(result); 
            console.log(result); 
            if(localStorage.token!=undefined){
               navigate("/");
            }
          }
         }
    }catch(err) 
    {  console.log(err.message); 
       toast.error(err.message); 
    }
  }

  return (
    <div className='getForm'>  
      <form onSubmit={handleAuth} >  
          {bollen?(<div>
          <input type="text" value={name}  onChange={(e)=>{setname(e.target.value)}}
          placeholder='name'  
         id="name"></input>
         </div>):null} 
          
         <div><input type="text" value={namespace} placeholder='nameSpace'
         id="namespace" onChange={(e)=>{setnamespace(e.target.value)}}></input>
         </div>
         <div>
          <input type="password" value={password}  onChange={(e)=>{setpassword(e.target.value)}}
         id="password" placeholder='password'></input>
         </div>
         <button style={{marginLeft:"44%"}}>Submit</button> 
         <p>{message}</p>
           <div> 
            <button type="button" onClick={()=>setbollen(true)} >Sign up</button>
            <button type="button" onClick={()=>setbollen(false)}>Log in</button>   
         </div> 
      </form>   
      <ToastContainer/>
    </div> 
  ) 
}
