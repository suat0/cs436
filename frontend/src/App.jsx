import { Routes, Route } from "react-router-dom";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import LoginSignup from "./pages/LoginSignup";
import Orders from "./pages/Orders";
import Navbar from "./components/Navbar";
import Shop from "./pages/Shop";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/account" element={<LoginSignup />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/shop" element={<Shop />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;


