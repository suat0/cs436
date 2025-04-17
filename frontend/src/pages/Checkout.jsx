// src/pages/Checkout.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';

const CheckoutPage = () => {
  const navigate = useNavigate();

  const [addressInfo, setAddressInfo] = useState({
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    zip: '',
    country: '',
  });
  const [paymentInfo, setPaymentInfo] = useState({
    name: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });
  const [cartItems, setCartItems] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load cart on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/cart', { credentials: 'include' });        // cart.js :contentReference[oaicite:2]{index=2}
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load cart');
        setCartItems(data.items);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, []);

  // Handlers
  const handleAddressChange = e => {
    const { name, value } = e.target;
    setAddressInfo(ai => ({ ...ai, [name]: value }));
  };
  const handlePaymentChange = e => {
    const { name, value } = e.target;
    setPaymentInfo(pi => ({ ...pi, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1) Process payment
      const payRes = await fetch('/api/payment', {                                  // payment.js :contentReference[oaicite:3]{index=3}&#8203;:contentReference[oaicite:4]{index=4}
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          cardNumber: paymentInfo.cardNumber,
          expiryDate: paymentInfo.expiry,
          cvv: paymentInfo.cvv,
          amount: cartItems.reduce((sum, it) => sum + it.product.price * it.quantity, 0),
        }),
      });
      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData.error);

      // 2) Checkout
      const coRes = await fetch('/api/checkout', {                                // checkout.js :contentReference[oaicite:5]{index=5}&#8203;:contentReference[oaicite:6]{index=6}
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          cartItems: cartItems.map(item => ({
            productId: item.product_id,
            quantity: item.quantity,
          })),
          payment_name: paymentInfo.name,
          delivery_address:
            `${addressInfo.firstName} ${addressInfo.lastName}, ` +
            `${addressInfo.street}, ${addressInfo.city} ${addressInfo.zip}, ` +
            addressInfo.country,
          paymentDetails: {
            cardNumber: paymentInfo.cardNumber,
            cvv: paymentInfo.cvv,
            expiryDate: paymentInfo.expiry,
          },
        }),
      });
      const coData = await coRes.json();
      if (!coRes.ok) throw new Error(coData.error);

      // 3) Redirect to Order Confirmation
      navigate(`/checkout/${coData.orderId}`);                                     // App.jsx route :contentReference[oaicite:7]{index=7}&#8203;:contentReference[oaicite:8]{index=8}

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (error) {
    return <div className="checkout-wrapper"><p style={{ color: 'red' }}>Error: {error}</p></div>;
  }
  if (!cartItems) {
    return <div className="checkout-wrapper"><p>Loading cart…</p></div>;
  }

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="checkout-wrapper">
      <h2 className="checkout-header">Checkout</h2>
      <div className="checkout-grid">

        {/* LEFT SIDE: FORM */}
        <div className="checkout-left">
          <h3 className="section-title">1. Delivery</h3>
          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                type="text" name="firstName" placeholder="First Name"
                value={addressInfo.firstName} onChange={handleAddressChange}
                required disabled={loading}
              />
              <input
                type="text" name="lastName" placeholder="Last Name"
                value={addressInfo.lastName} onChange={handleAddressChange}
                required disabled={loading}
              />
            </div>
            <input
              type="text" name="street" placeholder="Street Address"
              value={addressInfo.street} onChange={handleAddressChange}
              required disabled={loading}
            />
            <div className="form-row">
              <input
                type="text" name="city" placeholder="City"
                value={addressInfo.city} onChange={handleAddressChange}
                required disabled={loading}
              />
              <input
                type="text" name="zip" placeholder="ZIP Code"
                value={addressInfo.zip} onChange={handleAddressChange}
                required disabled={loading}
              />
            </div>
            <input
              type="text" name="country" placeholder="Country"
              value={addressInfo.country} onChange={handleAddressChange}
              required disabled={loading}
            />

            <h3 className="section-title">2. Payment</h3>
            <input
              type="text" name="name" placeholder="Name on Card"
              value={paymentInfo.name} onChange={handlePaymentChange}
              required disabled={loading}
            />
            <input
              type="text" name="cardNumber" placeholder="Card Number"
              value={paymentInfo.cardNumber} onChange={handlePaymentChange}
              maxLength={16} required disabled={loading}
            />
            <div className="form-row">
              <input
                type="text" name="expiry" placeholder="MM/YY"
                value={paymentInfo.expiry} onChange={handlePaymentChange}
                required disabled={loading}
              />
              <input
                type="text" name="cvv" placeholder="CVV"
                value={paymentInfo.cvv} onChange={handlePaymentChange}
                maxLength={4} required disabled={loading}
              />
            </div>

            <button type="submit" className="checkout-btn" disabled={loading}>
              {loading ? 'Processing…' : 'Pay Now'}
            </button>
          </form>
        </div>

        {/* RIGHT SIDE: ORDER SUMMARY */}
        <div className="checkout-right">
          <h3 className="section-title">Your Order</h3>
          <ul className="order-list">
            {cartItems.map(item => (
              <li key={item.id}>
                <span>
                  {item.product.name} x {item.quantity}
                </span>
                <span>
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>
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
