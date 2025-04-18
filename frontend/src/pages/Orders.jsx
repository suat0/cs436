import React, { useEffect, useState } from "react";
import "./Orders.css";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("processing");

  const TABS = ["processing", "in-transit", "delivered", "cancelled"];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders", {
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setOrders(data.orders);
          console.log(data.orders);
        } else {
          throw new Error(data.message || "Failed to load orders");
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };

    fetchOrders();
  }, []);

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
              {(order.items || []).map((item, i) => (
                  <div className="order-item" key={i}>
                    <img src={item.product.image_url} alt={item.product.name} />
                    <div>
                      <div className="item-name">{item.product.name}</div>
                      <div className="item-details">
                        €{parseFloat(item.price_at_purchase).toLocaleString()} x{item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-total">
                Total: €{parseFloat(order.total_price).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
