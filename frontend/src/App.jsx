import { Routes, Route } from "react-router-dom";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import LoginSignup from "./pages/LoginSignup";
import Orders from "./pages/Orders";
import Navbar from "./components/Navbar";
import Comment from  "./pages/Comment";

function App() {
  const appContainerStyle = {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  };

  const mainContentStyle = {
    flex: 1, 
  };

  return (
    <div style={appContainerStyle}>
      <Navbar />
      <div style={mainContentStyle}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/account" element={<LoginSignup />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/comments" element={<Comment />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;


