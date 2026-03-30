import React, { useEffect, useState } from 'react'
import {Link} from "react-router-dom";
export default function LandingPage() {
  
 const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("token"));

const handleLogout = () => {
  localStorage.removeItem("token");
  setIsLoggedIn(false);
};
  
  return (
    <div className='landingPageContainer'>
        <nav>
          <div className='navHeader'>
              <h2>Apna video call</h2>
          </div>
         <div className="navlist">
            <Link to="/home"><p>Join in as Guest</p></Link>
            <Link to='/auth'><p>Register</p></Link>
          <div role="button">
          { isLoggedIn ? 
          <Link onClick={handleLogout}>LogOut</Link>:
          <Link to="/auth">Login</Link>
          } 
          </div>
          </div>    
        </nav>   
        <div className='landingMainContainer'>
            <div>
              <h1><span style={{color:"orange"}}>Connection</span> connect with your loved ones</h1>

              <p>cover a distance by apna video call</p>
              <div role='button'>
                <Link to={'/auth'}>get started</Link>
              </div>
            </div>
            <div><img src="/mobile.png"/></div>
        </div>
    </div>
  )
}
