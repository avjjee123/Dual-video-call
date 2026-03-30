import { useState } from 'react'
import {Routes,Route} from "react-router-dom"; 
import './App.css'
import LandingPage from './pages/landing';
import Authentication from './pages/authentication';
import { AuthProvider } from './contexts/AuthContext';
import VideoMeetComponent from './pages/videoMeet';
import Home from './pages/home'; 
import History from './pages/history';
function App() {
  return (
    <> 
        <AuthProvider>
          <Routes>   

           <Route path="/" element={<LandingPage/>}/>
           <Route path="/auth" element={<Authentication/>}/>
           <Route path="/home" element={<Home/>} />
           <Route path="/history" element={<History/>}/> 
           <Route path="/:url" element={<VideoMeetComponent/>}/> 
           

          </Routes> 
        </AuthProvider>
    </>
  )
}

export default App
