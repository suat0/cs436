import React from "react";
import "./Orders.css";

const OrdersPage = () => {
  const orders = [
    {
      id: 101,
      user_id: 1,
      total_price: 849.0,
      delivery_address: "Illinois, United States",
      status: "in-transit",
      date: "2024-05-25",
      items: [
        {
          product_id: 1,
          name: "Japan Green Outer",
          image: "https://via.placeholder.com/80",
          price_at_purchase: 399.0,
          quantity: 1,
        },
        {
          product_id: 2,
          name: "White off jacket 2024",
          image: "https://via.placeholder.com/80",
          price_at_purchase: 450.0,
          quantity: 1,
        },
      ],
    },
    {
      id: 102,
      user_id: 1,
      total_price: 300.0,
      delivery_address: "Illinois, United States",
      status: "in-transit",
      date: "2024-05-25",
      items: [
        {
          product_id: 3,
          name: "Soft Hoodie",
          image: "https://via.placeholder.com/80",
          price_at_purchase: 300.0,
          quantity: 1,
        },
      ],
    },
  ];

  const TABS = ["processing", "in-transit", "delivered", "cancelled"];
  const [activeTab, setActiveTab] = React.useState("in-transit");

  const filteredOrders = orders.filter((order) => order.status === activeTab);

  return (
    <div className="orders-page">
      <h2>My Orders</h2>
      <div className="order-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`tab-button ${tab === activeTab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.replace("-", " ").replace(/^./, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>
      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <p className="empty">No orders in this category.</p>
        ) : (
          filteredOrders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-header">
                <div className="order-id">Order #{order.id}</div>
                <div className="order-status">{order.status}</div>
              </div>
              <div className="order-info">
                <div className="order-date">Estimated arrival: {order.date}</div>
                <div className="order-address">{order.delivery_address}</div>
              </div>
              <div className="order-items">
                {order.items.map((item, i) => (
                  <div className="order-item" key={i}>
                    <img src={item.image} alt={item.name} />
                    <div>
                      <div className="item-name">{item.name}</div>
                      <div className="item-details">
                        €{item.price_at_purchase.toLocaleString()} x{item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-total">Total: €{order.total_price.toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
