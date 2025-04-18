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

  const [addressInfo, setAddressInfo] = useState({
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    zip: "",
    country: "",
  });

  const total = cartItems.reduce(
    (acc, item) => acc + (parseFloat(item.product?.price || item.Current_Price || 0) * item.quantity),
    0
  );

  const handlePaymentChange = (e) => {
    setPaymentInfo({ ...paymentInfo, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    setAddressInfo({ ...addressInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Payment submitted successfully! (Not really)");
  };

  return (
    <div className="checkout-wrapper">
      <h2 className="checkout-header">Checkout</h2>
      <div className="checkout-grid">
        <div className="checkout-left">
          <h3 className="section-title">1. Delivery</h3>
          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={addressInfo.firstName}
                onChange={handleAddressChange}
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={addressInfo.lastName}
                onChange={handleAddressChange}
                required
              />
            </div>
            <input
              type="text"
              name="street"
              placeholder="Street Address"
              value={addressInfo.street}
              onChange={handleAddressChange}
              required
            />
            <div className="form-row">
              <input
                type="text"
                name="city"
                placeholder="City"
                value={addressInfo.city}
                onChange={handleAddressChange}
                required
              />
              <input
                type="text"
                name="zip"
                placeholder="ZIP Code"
                value={addressInfo.zip}
                onChange={handleAddressChange}
                required
              />
            </div>
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={addressInfo.country}
              onChange={handleAddressChange}
              required
            />

            <h3 className="section-title">2. Payment</h3>
            <input
              type="text"
              name="name"
              placeholder="Name on Card"
              value={paymentInfo.name}
              onChange={handlePaymentChange}
              required
            />
            <input
              type="text"
              name="cardNumber"
              placeholder="Card Number"
              value={paymentInfo.cardNumber}
              onChange={handlePaymentChange}
              maxLength={16}
              required
            />
            <div className="form-row">
              <input
                type="text"
                name="expiry"
                placeholder="MM/YY"
                value={paymentInfo.expiry}
                onChange={handlePaymentChange}
                required
              />
              <input
                type="text"
                name="cvv"
                placeholder="CVV"
                value={paymentInfo.cvv}
                onChange={handlePaymentChange}
                maxLength={4}
                required
              />
            </div>
            <button type="submit" className="checkout-btn">Pay Now</button>
          </form>
        </div>

        <div className="checkout-right">
          <h3 className="section-title">Your Order</h3>
          <ul className="order-list">
            {cartItems.map((item) => (
              <li key={item.id || item.Id}>
                <span>{item.product?.name || item.Name} x {item.quantity}</span>
                <span>${(parseFloat(item.product?.price || item.Current_Price)).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="order-total">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
