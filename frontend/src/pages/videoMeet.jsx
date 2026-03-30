import React, {  use, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom';
import {io} from "socket.io-client";
import {IconButton,Button,Badge} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff' 
import ScreenShareIcon from '@mui/icons-material/ScreenShare' 
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare' 
import MailIcon from '@mui/icons-material/Mail' 
import TextField from '@mui/material/TextField'; 

import style from "./videoMeet.module.css"; 

const server_url="http://localhost:8000";

var connections={};

const peerConfigConnections={
  "iceServers":[
    {"urls":"stun:stun.l.google.com:19302"} 
  ]
}

export default function VideoMeetComponent() {

  var socketRef=useRef(); 
  let socketIdRef=useRef(); 

  let localVideoRef = useRef(); 

  let [videoAvailable,setvideoAvailable]= useState(true);

  let [audioAvailable,setaudioAvailable]= useState(true); 

  let [video,setvideo]=useState(); 
  let [audio,setaudio]=useState();
  let [screen,setscreen]=useState(false);   
  let [showModal,setModal]=useState(true); 
  let [screenAvailabel,setscreenAvailable]=useState();
  let [messages,setmessages]=useState([]);
  let [message,setmessage]=useState("");
  let [newMessages,setnewMessages]=useState(0);
  let [askForUsername,setaskForUsername]=useState(true);
  let [username,setusername]=useState("");
  let videoRef=useRef([]);
  let [videos,setvideos]=useState([]); 
  let navigate=useNavigate(); 

  // if(isChrome()===false)
  // {

  // }
const getPermission=async()=>{
   try{
 let audioPermission=await navigator.mediaDevices.getUserMedia({audio:true});
   if(audioPermission)
   { console.log("audio on");
    setaudioAvailable(true);
   } else {setaudioAvailable(false); } 

    let videoPermission=await navigator.mediaDevices.getUserMedia({video:true});
   if(videoPermission)
   {  
    console.log("video on");
     setvideoAvailable(true);
   } else {setvideoAvailable(false);}
   
   if(navigator.mediaDevices.getDisplayMedia)
   {
    setscreenAvailable(true);
   } else{
    setscreenAvailable(false); 
   }

   if(videoPermission || audioPermission)
   {
    const userMediaStream=await navigator.mediaDevices.getUserMedia({
      video:videoPermission,audio:audioPermission 
    }); 
    if(videoPermission || audioPermission){
    window.localStream=userMediaStream;
    if(localVideoRef.current){
      localVideoRef.current.srcObject=userMediaStream;
     }
     }
   }
   } catch(err){
    console.log(err);
   }
}

useEffect(()=>{
  getPermission(); 
},[]);

let getuserMediaSuccess=(stream)=>{
   try{
        window.localStream.getTracks().forEach(track=>track.stop()) 
   } catch(e){
    console.log(e);
   }
   window.localStream=stream; 
   localVideoRef.current.srcObject=stream;

   for(let id in connections){
      if(id == socketIdRef.current) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description)=>{
        connections[id].setLocalDescription(description)
        .then(()=>{
          socketRef.current.emit("signal",id,
            JSON.stringify({"sdp":connections[id].localDescription}));
        }).catch(e=>console.log(e))
      }).catch(e=>console.log(e))
   }

   stream.getTracks().forEach(track=>track.onended=()=>{
     setvideo(false);
     setaudio(false); 
      
     try{
      let tracks=localVideoRef.current.srcObject.getTracks()
      tracks.forEach(track=>track.stop())
     } catch(e){console.log(e)}

     let blackSilence = (...args)=>new MediaStream([black(...args),silence()])
      window.localStream=blackSilence();
      localVideoRef.current.srcObject=window.localStream;

     for(let id in connections){
      if(id==socketIdRef.current) continue; 
      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description)=>{
        connections[id].setLocalDescription(description).then(()=>{
          socketRef.current.emit("signal",id,
          JSON.stringify({"sdp":connections[id].localDescription})); 
        }).catch(e=>console.log(e))
      }).catch(e=>console.log(e)) 
     }
   })
}

let silence =()=>{
      let ctx = new AudioContext()
      let oscillator = ctx.createOscillator();

      let dst =oscillator.connect(ctx.createMediaStreamDestination());

     oscillator.start();
     ctx.resume()
     return Object.assign(dst.stream.getAudioTracks()[0],{enabled:false})
    }

    let black=({width = 640,height= 480}= {})=>{
      let canvas = Object.assign(document.createElement("canvas"),{width,height});

      canvas.getContext('2d').fillRect(0,0,width,height); 
      let stream = canvas.captureStream(); 
      return Object.assign(stream.getVideoTracks()[0],{enabled:true}) 
    }

let getuserMedia=()=>{ 
  if((video && videoAvailable) || (audio && audioAvailable))
  {
    navigator.mediaDevices.getUserMedia({video:video,audio:audio})
    .then(getuserMediaSuccess)  //TODO: getuserMediSuccess
    .then((stream)=>{ })
    .catch((e)=>console.log(e)); 
  }else{
    try{
      let tracks =localVideoRef.current.srcObject.getTracks();
      tracks.forEach(track=>track.stop()) 
    } catch(e){}
  }
}

useEffect(()=>{ 
    if(video != undefined && audio != undefined){
      getuserMedia(); 
    } 
},[audio,video])

//TODO
let gotMessageFromServer=(fromId,message)=>{
    // console.log("Signal received:", fromId, message);
    var signal= JSON.parse(message)

    if(fromId != socketIdRef.current){
       if(signal.sdp){
          connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(()=>{
             if(signal.sdp.type== "offer"){
              connections[fromId].createAnswer().then((description)=>{
                connections[fromId].setLocalDescription(description).then(()=>{
                  socketRef.current.emit("signal",fromId,JSON.stringify({"sdp":connections[fromId].localDescription}
                  )).catch(e =>console.log(e))
                }).catch(e=>console.log(e))
              })
             } 
          })
       }
       if(signal.ice){
        connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice))
        .catch(e=>console.log(e)) 
       }
    }
}

//TODO addmessage 
let addMessage=(data,sender,socketIdSender)=>{
    
  setmessages((prevmessage)=>[
    ...prevmessage,
    {sender:sender,data:data} 
  ]); 

  if(socketIdSender !== socketIdRef.current) {
     setnewMessages((prevmessage)=>prevmessage+1);  
  } 

}

let connectToSocketServer=()=>{
    
     socketRef.current = io.connect(server_url, {secure:false})
     socketRef.current.on('signal', gotMessageFromServer) 
     socketRef.current.on("connect",()=>{

        socketRef.current.emit("join-call",window.location.href)
        socketIdRef.current=socketRef.current.id
        socketRef.current.on("chat-message",addMessage)
        socketRef.current.on("user-left",(id)=>{
            setvideos((videos)=>videos.filter((video)=>video.socketId !==id))
        })
        socketRef.current.on("user-joined",(id,clients)=>{
          clients.forEach((socketListId)=>{  
              connections[socketListId] = new RTCPeerConnection(peerConfigConnections)

              connections[socketListId].onicecandidate = (event)=>{
                if(event.candidate !=null){
                  socketRef.current.emit("signal",socketListId,JSON.stringify({'ice':event.candidate}))
                }
              } 
              connections[socketListId].onaddstream=(event)=>{
                  
                let videoExists =videoRef.current.find(video=>
                  video.socketId == socketListId);
                
                if(videoExists){ 
                  setvideos(videos=>{
                    const updatedVideos=videos.map(video=>
                      video.socketId == socketListId?{...video,
                        stream:event.stream}:video );  
                    videoRef.current=updatedVideos;
                    return updatedVideos; 
                  })
                } else{
                     
                  let newVideo={
                    socketId:socketListId,
                    stream:event.stream,
                    autoPlay:true,
                    playsInline:true
                  }
                  setvideos(videos=>{
                    const updatedVideos=[...videos,newVideo]; 
                    videoRef.current=updatedVideos; 
                    return updatedVideos;
                  });
                } 
              };
              
            if(window.localStream != undefined && window.localStream !=null){
              connections[socketListId].addStream(window.localStream);
            } else{
              //TODO BLACKSILENCE
              //LET BLACK

              let blackSilence = (...args)=>new MediaStream([black(...args),silence()])
              window.localStream=blackSilence();
              connections[socketListId].addStream(window.localStream); 
            }

          })
        if(id==socketIdRef.current){
          for(let id2 in connections){ 
            if(id2 == socketIdRef.current) continue

            try{
              connections[id2].addStream(window.localStream)
            } catch(e){ } 

            connections[id2].createOffer().then((description)=>{
              connections[id2].setLocalDescription(description)
              .then(()=>{
                socketRef.current.emit("signal",id2,JSON.stringify({"sdp":connections[id2].localDescription})); 
              }) 
              .catch(e=>console.log(e))
            })
          }
        }
        })

     })
}  

 let getMedia =()=>{
  setvideo(videoAvailable);
  setaudio(audioAvailable);
  connectToSocketServer();
 }
 
 let getDisplayMediaSuccess=(stream)=>{
  try{
     window.localStream.getTracks().forEach(track=>track.stop()) 

  } catch(e){
    console.log(e); 
  }

  window.localStream=stream; 
  localVideoRef.current.srcObject=stream; 

  for(let id in connections)
  {
    if(id==socketIdRef.current) continue; 

    connections[id].addStream(window.localStream) 
    connections[id].createOffer().then((description)=>{
      connections[id].setLocalDescription(description)
      .then(()=>{
        socketRef.current.emit('signal',id,JSON.stringify({"sdp":connections[id].localDescription})); 
      }).catch(e=>console.log(e)) 
    })
  }

  stream.getTracks().forEach(track=>track.onended=()=>{
     setscreen(false);  
      
     try{
      let tracks=localVideoRef.current.srcObject.getTracks()
      tracks.forEach(track=>track.stop())
     } catch(e){console.log(e)}

     let blackSilence = (...args)=>new MediaStream([black(...args),silence()])
      window.localStream=blackSilence();
      localVideoRef.current.srcObject=window.localStream;

     getuserMedia();
   })

 }
 let getDisplayMedia =()=>{
      if(screen){
        if(navigator.mediaDevices.getDisplayMedia){
          navigator.mediaDevices.getDisplayMedia({video:true , audio:true})
          .then(getDisplayMediaSuccess)
          .then((stream)=>{})
          .catch(err=>console.log(err));  
        }
      }
 }

 useEffect(()=>{
    if(screen) { 
    getDisplayMedia();  }
  else{
    getuserMedia();
  }
 },[screen]); 

let handleVideo=()=>{
  setvideo(!video); 
 }
 let handleMic=()=>{
  setaudio(!audio); 
 }
 let handleDisplay=()=>{
  setscreen(!screen); 
 }
 let sendMessage=()=>{
   socketRef.current.emit("chat-message",message,username); 
   setmessage(""); 
 } 
 let logoutUser=()=>{
   socketRef.current.disconnect(); 
   let tracks=localVideoRef.current.srcObject.getTracks(); 
   tracks.forEach((track)=>track.stop()); 
   setmessages([]); 
   navigate("/home");   

 }

let connect =()=>{
  setaskForUsername(false);
  getMedia();
}
  return (
    <>
      
    {askForUsername===true?
    <div className={style.meet} style={{marginLeft:"17px", paddingInline:"auto",width:"100%"}}> 
    <p>enter into lobby</p>  
     <input type="text" value={username} placeholder='username'
     onChange={(e)=>{setusername(e.target.value)}}></input>
     <button variant="contained" onClick={connect}>connect</button>
     <div>
       <video ref={localVideoRef} autoPlay muted width="400"
     playsInline/>
      </div> 
    </div>:<div className={style.meetVideoContainer}>
    
      {
        showModal?<div className={style.chatRoom}> 
         <div className={style.chatContainer}>  

            <h1 style={{color:"black"}}>Chat</h1>

            <div className={style.chattingDisplay}>
                {messages.map((msg, i) => (
                 <div key={i}> 
                  <p style={{opacity:"0.7", fontSize:"15px"}}>{msg.sender}</p>
                  <h4 style={{color:"black"}}>{msg.data}</h4> 
                 </div>
                ))}  
            </div>

              <div className={style.chattingArea}>            
                <TextField value={message} onChange={e=>setmessage(e.target.value)}  
                id='outlined-basic' label="Enter the Chat" variant='outlined'/>
                   <button onClick={sendMessage}  
                   ><i className="fa-regular fa-paper-plane"></i></button>
            </div>
         </div>
         <div>
           
         </div>
      </div>:<></> 
      }
     <div className={style.buttonContainers}>
         <IconButton onClick={handleVideo} style={{color:"white",transform:"scale(1.2)"}}>
          {(video == true)?<VideocamIcon/>:<VideocamOffIcon/>} 
         </IconButton>
         <IconButton style={{color:"red",transform:"scale(1.2)"}} onClick={logoutUser}>
           <CallEndIcon/>
         </IconButton>
         <IconButton onClick={handleMic} style={{color:"white",transform:"scale(1.2)"}}>
           {audio==true?<MicIcon/>:<MicOffIcon/>} 
         </IconButton> 
      {screenAvailabel==true? 
         <IconButton onClick={handleDisplay}> 
           {screen==true?<ScreenShareIcon/>:<StopScreenShareIcon/>}
         </IconButton>:<></>
      }
         <Badge badgeContent={newMessages} max={999} color="secondary"> 
          <IconButton onClick={()=>{setModal(!showModal)}}>
             <MailIcon color='action'/> 
          </IconButton>
         </Badge>
     </div>

    <video className={style.meetUserVideo} ref={localVideoRef}  autoPlay muted 
     playsInline/> 
     <div className={style.conferenceView}>
      {videos.map((video)=>(
        <div key={video.socketId}> 
             <video ref={ref=>{ 
              if(ref && video.stream){
                ref.srcObject=video.stream; 
              }
             }}  autoPlay muted width="400"
             playsInline/>
        </div>
       )) }
      </div> 
     </div>
     }

     
    </>
  )
}
