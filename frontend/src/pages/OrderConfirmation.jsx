import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './OrderConfirmation.css'; 

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5001/api/invoices/${orderId}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch invoice");
        return res.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      })
      .catch(err => {
        console.error("Invoice fetch error:", err);
        alert("Failed to load invoice.");
      });
  }, [orderId]);

  const handleDownload = () => {
    if (!pdfUrl) return;

    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `invoice_${orderId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(pdfUrl);
  };

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <h1 className="confirmation-title">Order Confirmed</h1>
        <p className="confirmation-subtext">Thank you for your purchase!</p>
        <p><strong>Order ID:</strong> {orderId}</p>

        <button className="download-btn" onClick={handleDownload}>
          Download Invoice
        </button>

        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            title="Invoice PDF"
            className="invoice-preview"
          ></iframe>
        ) : (
          <p>Loading invoice preview...</p>
        )}
      </div>
    </div>
  );
}




