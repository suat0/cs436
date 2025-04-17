import React, { useState } from "react";
import { useNavigate} from "react-router-dom";
import "./LoginSignup.css"; 

const LoginSignup = () => {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ Name: "", Email: "", Password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({ Name: "", Email: "", Password: "" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
  
    const url = isLogin 
      ? "http://localhost:5001/auth/login"  
      : "http://localhost:5001/auth/signup";  
  
    const payload = isLogin
      ? { Name: formData.Name, Password: formData.Password } 
      : { Name: formData.Name, Email: formData.Email, Password: formData.Password }; 
  
    try {
      const response = await fetch(url, {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload), 
        credentials: "include", 
      });
  
      const data = await response.json(); 
  
      if (response.ok) {
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
          {!isLogin && (
            <div className="input-group">
              <label>Email</label>
              <input type="Email" name="Email" placeholder="Enter your email" value={formData.Email} onChange={handleChange} required={!isLogin}/>
            </div>
          )}

          <div className="input-group">
            <label>Username</label>
            <input type="text" name="Name" placeholder="Enter your username" value={formData.Name} onChange={handleChange} required/>
          </div>


          <div className="input-group">
            <label>Password</label>
            <input type="Password" name="Password" placeholder="Enter your password" value={formData.Password} onChange={handleChange} required />
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