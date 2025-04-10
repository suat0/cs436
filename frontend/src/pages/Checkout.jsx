import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import "./Checkout.css";

const CheckoutPage = () => {
  const { cartItems } = useCart();
  const [paymentInfo, setPaymentInfo] = useState({
    name: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const total = cartItems.reduce(
    (acc, item) => acc + (parseFloat(item.product?.price || item.Current_Price || 0) * item.quantity),
    0
  );

  const handleChange = (e) => {
    setPaymentInfo({ ...paymentInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Payment submitted successfully! (Not really)");
  };

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>

      <div className="checkout-summary">
        <h3>Order Summary</h3>
        <ul>
          {cartItems.map((item) => (
            <li key={item.id || item.Id}>
              {item.product?.name || item.Name} x {item.quantity} — $
              {(parseFloat(item.product?.price || item.Current_Price)).toFixed(2)}
            </li>
          ))}
        </ul>
        <h4>Total: ${total.toFixed(2)}</h4>
      </div>

      <form className="payment-form" onSubmit={handleSubmit}>
        <h3>Payment Details</h3>
        <label>
          Name on Card
          <input
            type="text"
            name="name"
            value={paymentInfo.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Card Number
          <input
            type="text"
            name="cardNumber"
            value={paymentInfo.cardNumber}
            onChange={handleChange}
            maxLength={16}
            required
          />
        </label>

        <label>
          Expiry Date
          <input
            type="text"
            name="expiry"
            placeholder="MM/YY"
            value={paymentInfo.expiry}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          CVV
          <input
            type="text"
            name="cvv"
            value={paymentInfo.cvv}
            onChange={handleChange}
            maxLength={4}
            required
          />
        </label>

        <button type="submit" className="checkout-btn">Pay Now</button>
      </form>
    </div>
  );
};

export default CheckoutPage;