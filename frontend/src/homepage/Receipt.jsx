import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useLocation } from 'react-router-dom';
import JsBarcode from 'jsbarcode';
import './Receipt.css'; // Assuming you have your styles in this file

// Using forwardRef to expose the print functionality to a parent component
const Receipt = forwardRef((props, ref) => {
  const location = useLocation();
  const receiptData = location.state?.receiptData;

  const receiptRef = useRef(); // Reference to the receipt content

  useEffect(() => {
    if (receiptData?.transactionId) {
      JsBarcode("#barcode", receiptData.transactionId, {
        format: "CODE128",
        lineColor: "#000",
        width: 2,
        height: 40,
        displayValue: true,
      });
    }
  }, [receiptData]);

  // Expose the handlePrint function to the parent component
  useImperativeHandle(ref, () => ({
    handlePrint() {
      window.print(); // Triggers the print dialog
    }
  }));

  if (!receiptData) {
    return <div>No receipt data available</div>;
  }

  return (
    <div className="receipt-container">
      {/* Receipt Content */}
      <div ref={receiptRef} className="receipt-body">
        <div className="receipt-header">
          <h1>Sales Receipt</h1>
        </div>
        <div className="date-transaction">
          <div><p>{receiptData.date}</p></div>
          <div><p><strong>Transaction ID:</strong> {receiptData.transactionId}</p></div>
        </div>
        <div className="company-name">
          <div><h4>{receiptData.businessName}</h4></div>
          <div><p>0729712952</p></div>
        </div>
        
        <p><strong>Cashier Name:</strong> {receiptData.cashierName}</p>
        <p><strong>Payment Method:</strong> {receiptData.paymentMethod}</p>
       
        <h3>Items Purchased</h3>
        <ul>
          {receiptData.items?.map((item, index) => (
            <li key={index}>
              {item.name} - {item.quantity} @ KSH {item.selling_price.toFixed(2)} 
            </li>
          ))}
        </ul>
        
        <div className="tax-discount">
          <div><strong>Local Sales Tax:</strong> KSH {receiptData.totalTax}</div>
        </div>

        <h4>Total: KSH {receiptData.totalAmount}</h4> 
      </div>
      
      <div className="receipt-footer">
        <h2>Barcode</h2>
        {/* Barcode for the transaction */}
        <svg id="barcode"></svg>
      </div>
    </div>
  );
});

export default Receipt;
