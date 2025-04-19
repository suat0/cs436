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
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankCode, setBankCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Load cart on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/cart', { credentials: 'include' });
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
      const payRes = await fetch('/api/payment', {
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

      // Show bank verification modal
      setShowBankModal(true);
      setLoading(false);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleConfirmCode = async () => {
    if (bankCode !== '123456') {
      setError('Invalid code');
      return;
    }
    setShowBankModal(false);
    setIsProcessing(true);

    try {
      // Add 5 second delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Proceed to checkout
      const coRes = await fetch('/api/checkout', {
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

      setIsProcessing(false);
      setIsConfirmed(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/checkout/${coData.orderId}`);
      }, 2000);

    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  if (error) {
    return <div className="checkout-wrapper"><p style={{ color: 'red' }}>Error: {error}</p></div>;
  }
  if (!cartItems) {
    return <div className="checkout-wrapper"><p>Loading cart…</p></div>;
  }

  if (isProcessing) {
    return (
      <div className="payment-processing">
        <div className="processing-spinner"></div>
        <h2>Processing Payment...</h2>
        <p>Please wait while we complete your transaction</p>
      </div>
    );
  }

  if (isConfirmed) {
    return (
      <div className="payment-confirmed">
        <div className="checkmark">✓</div>
        <h2>Payment Confirmed!</h2>
        <p>Your order has been successfully placed</p>
        <p className="redirect-message">Redirecting to order details...</p>
      </div>
    );
  }

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="checkout-wrapper">
      {showBankModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <div className="bank-logo">
                  <svg viewBox="0 0 24 24" width="32" height="32">
                    <path d="M12 2L2 8v2h20V8L12 2zm0 3L6 8h12l-6-3zM4 12v6h4v-6H4zm6 0v6h4v-6h-4zm6 0v6h4v-6h-4zM2 20h20v2H2v-2z" fill="currentColor"/>
                  </svg>
                </div>
                
              </div>

              <div className="auth-content">
                <h2>Purchase Authentication</h2>
                <p className="auth-message">
                  We've sent you a text message to your registered mobile number ending in 2329.
                </p>

                <div className="confirmation-input">
                  <label>Confirmation code</label>
                  <input
                    type="text"
                    value={bankCode}
                    onChange={e => setBankCode(e.target.value)}
                    maxLength={6}
                    placeholder=""
                    autoFocus
                  />
                </div>

                <button 
                  className="confirm-button"
                  onClick={handleConfirmCode}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Confirm payment'}
                </button>

                <button className="resend-button" onClick={() => setBankCode('')}>
                  Resend code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
