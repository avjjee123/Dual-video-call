import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import style from "./history.module.css"; 
export default function History() {

    const {getUserHistory} =useContext(AuthContext); 
    let [meetings,setmeetings]=useState([]); 
    let navigate=useNavigate(); 

    useEffect(()=>{
       const fetchHistory=async()=>{
        try{
            const history=await getUserHistory();
            setmeetings(history);  
        }catch(e){
            navigate('/'); 
        }
       } 
       fetchHistory(); 
    },[]);
  
    let formateDate=(dateString)=>{
        const date=new Date(dateString)
        const day=date.getDate().toString().padStart(2,'0');
        const month=(date.getMonth()+1).toString().padStart(2,"0");
        const year=date.getFullYear(); 

        return `${day}/${month}/${year}`; 
    }
    const getHome=()=>{
        navigate("/");
    }
  return (
   <div style={{width:"100vw" ,textAlign:"center", }}>
   <h2 style={{marginBottom:"100px",fontSize:"50px", width:"100%", textAlign:"center"}}>
    History
   </h2>
    <div className={style.bodyTag}>  
        {
            meetings.map((meeting,i)=>(
               <div className={style.card} key={i}>
                  <div className={style.cardCode}>
                  <h3> Meeting Code: {meeting.meetingCode}</h3>
                  </div>
                  <div className={style.cardTime}>
                   <h3>Date: {formateDate(meeting.date)}  </h3>
                  </div>
               </div> 
            ))
        }
    </div>
    <button onClick={getHome} style={{marginTop:"15px",width:"20%",height:"auto",
        fontSize:"25px",borderRadius:"20px"
    }}>
        Back<i class="fa-light fa-arrow-right" style={{color:"silver"}}></i>
    </button>
   </div>
  )
}