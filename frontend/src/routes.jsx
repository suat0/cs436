import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginSignup from "./pages/LoginSignup";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/account" element={<LoginSignup />} />
    </Routes>
  );
}

export default AppRoutes;