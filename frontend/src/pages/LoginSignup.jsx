import React, { useState } from "react";
import "./LoginSignup.css"; 

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({ username: "", email: "", password: "" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
  
    const url = isLogin 
      ? "http://localhost:5000/login"  
      : "http://localhost:5000/signup"; 
  
    const payload = isLogin
      ? { username: formData.username, password: formData.password } 
      : { username: formData.username, email: formData.email, password: formData.password }; 
  
    try {
      // Send the request to the backend
      const response = await fetch(url, {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload), 
        credentials: "include", // Needed for session-based authentication (if backend uses cookies)
      });
  
      const data = await response.json(); 
  
      if (response.ok) {
        alert(isLogin ? "Login successful!" : "Signup successful!"); 
      } else {
        alert(data.error); 
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong"); 
    }
  };
  

  return (
    <div className="container">
      <div className={`form-container ${isLogin ? "login-mode" : "signup-mode"}`}>
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label>Email</label>
              <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} required={!isLogin}/>
            </div>
          )}

          <div className="input-group">
            <label>Username</label>
            <input type="text" name="username" placeholder="Enter your username" value={formData.username} onChange={handleChange} required/>
          </div>


          <div className="input-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} required />
          </div>

          <button type="submit" className="submit-btn">
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="toggle-text">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span className="toggle-link" onClick={toggleForm}>
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginSignup;