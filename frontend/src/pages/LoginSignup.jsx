import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginSignup.css"; 
import { useAuth } from "../context/AuthContext"; // Uncomment if using AuthContext
const LoginSignup = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Uncomment if using AuthContext

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: "", name: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({ email: "", name: "", password: "" });
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    console.log('Submitting form data:', formData);
  
    const url = isLogin 
      ? "/auth/login"  
      : "/auth/signup";  
  
    const payload = isLogin
      ? { email: formData.email, password: formData.password } 
      : { name: formData.name, email: formData.email, password: formData.password }; 
  
    try {
      console.log('Sending payload:', payload);
      const response = await fetch(url, {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload), 
        credentials: "include", 
      });
  
      const data = await response.json(); 
      console.log("Response data:", data);
      if (response.ok) {
        if (isLogin) {
          await login(formData.email, formData.password); // updates context state
        }
        setErrorMessage("");
        setSuccessMessage(isLogin ? "Login successful!" : "Signup successful!");
  
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
  
        // Navigate after 1.5 seconds (gives user time to read message)
        setTimeout(() => {
          navigate(-1);
        }, 1500);
      } else {
        setSuccessMessage("");
        setErrorMessage(data.error || "An error occurred");
  
        // Clear error message after 3 seconds
        setTimeout(() => {
          setErrorMessage("");
        }, 3000);
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Something went wrong");
  
      // Clear message after 3 seconds even on exception
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    }
  };

  return (
    <div className="container">
      <div className={`form-container ${isLogin ? "login-mode" : "signup-mode"}`}>
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>
        
        {errorMessage && <div className="message error">{errorMessage}</div>}
        {successMessage && <div className="message success">{successMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input 
              type="email" 
              name="email" 
              placeholder="Enter your email" 
              value={formData.email} 
              onChange={handleChange} 
              required
            />
          </div>

          {!isLogin && (
            <div className="input-group">
              <label>Username</label>
              <input 
                type="text" 
                name="name" 
                placeholder="Enter your username" 
                value={formData.name} 
                onChange={handleChange} 
                required={!isLogin}
              />
            </div>
          )}

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              placeholder="Enter your password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
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