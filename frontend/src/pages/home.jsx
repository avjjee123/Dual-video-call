import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { IconButton, TextField,Button, LinearProgress } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore'  
// import Button from '@mui/icons-material/Bu' 
import { useNavigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
function HomeComponent() { 

     const navigate=useNavigate(); 
     const [meetingCode,setmeetingCode]=useState("");
     const {addUserHistory,getUserHistory} =useContext(AuthContext); 

     let handleJoinVideoCall = async ()=>{
        await addUserHistory(meetingCode); 
        navigate(`/${meetingCode}`) 
     }
  return (
    <>
        <div className='navBar' style={{position:"absolute", top:"0.5rem"}}>
          <div className='navBar-direction'>
              <div className='navBar-left'><Link to="/"><h3 >Apna Video Call</h3></Link></div>
              <div className='navBar-right'> 
                <div style={{display:'flex', alignItems:"center"}}>
                  <div>
                     <IconButton onClick={()=>{
                 navigate("/history")
                                      }}>  
                  <RestoreIcon/>
                  </IconButton>
                </div>
                 <p>History</p>
                  </div>
                 <button onClick={()=>{  
                  localStorage.removeItem("token");
                  navigate("/auth"); 
                  }}> logOut </button> 
             </div>
          </div>  
        </div>  
  
        <div className='meetContainer' style={{marginTop:"-250px"}}>
            <div className="leftPanel" style={{position:"absolute",left:"0",width:"50%"}}>
                 <div>
                    <h2>Provide Quality Education to EveryOne in the Town</h2>
                    <div style={{display:'flex',gap:'10px'}}>
                       <TextField onChange={e=>setmeetingCode(e.target.value)} variant="outlined" id="outlined-basic"/>
                       <Button onClick={handleJoinVideoCall} variant="contained">Join Class</Button>
                    </div>
                 </div>
            </div>
            <div className='rightPanel' style={{position:"absolute",right:"0",width:"50%"}}>
              <img src="/mobile.png"></img>
            </div> 
        </div>
    </>
  )
}

export default withAuth(HomeComponent);
