import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { CartProvider } from "./context/CartContext";
import "./styles.css"; 

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* Wrapping the App component with BrowserRouter and CartProvider */}
  <BrowserRouter>
    <CartProvider> 
      <App />
    </CartProvider>
  </BrowserRouter>
  </React.StrictMode>
);
