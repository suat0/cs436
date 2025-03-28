import React from "react";
import { useCart } from "../context/CartContext";
import "./Cart.css";

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();

  const total = cartItems.reduce(
    (acc, item) => acc + item.Current_Price * item.quantity,
    0
  );

  return (
    <div className="cart-page">
      <h2 className="cart-title">Your Shopping Cart</h2>
      <div className="cart-items">
        {cartItems.map((item) => (
          <div key={item.Id} className="cart-item">
            <img
              src={item.Product_Image}
              alt={item.Name}
              className="cart-item-img"
            />
            <div className="cart-item-info">
              <h3>{item.Name}</h3>
              <p>${item.Current_Price.toFixed(2)}</p>
              <div className="cart-qty">
                <button onClick={() => updateQuantity(item.Id, -1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.Id, 1)}>+</button>
              </div>
              <button className="remove-btn" onClick={() => removeFromCart(item.Id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-total">
        <h3>Total: ${total.toFixed(2)}</h3>
        <button className="checkout-btn">Proceed to Checkout</button>
      </div>
    </div>
  );
};

export default CartPage;