import React from 'react';

const Receipt = React.forwardRef(({ transactionId, customerName, cart, totalAmount, paymentMethod, kraDetails }, ref) => {
  const currentDateTime = new Date().toLocaleString();

  return (
    <div ref={ref} className="receipt">
      <div className="header">
        <h2>{kraDetails.taxpayerName}</h2>
        <p>{kraDetails.address}</p>
        <p>PIN: {kraDetails.pin}</p>
        <h3>TAX INVOICE</h3>
        <p>Welcome to our shop</p>
        <p>Buyer PIN: {kraDetails.buyerPin || "N/A"}</p>
      </div>

      <div className="bodyz">
        <table className="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {cart.length > 0 ? (
              cart.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{Number(item.price || 0).toFixed(2)}</td>
                  <td>{(Number(item.price || 0) * item.quantity).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>No items in cart</td>
              </tr>
            )}
          </tbody>
        </table>
        <hr />
        <div className="summary">
          <p>Total BEFORE DISCOUNT: KSH {Number(totalAmount || 0).toFixed(2)}</p>
          <p>Total DISCOUNT AWARDED: KSH (0.00)</p> {/* Adjust discount as needed */}
          <p>SUB TOTAL: KSH {Number(totalAmount || 0).toFixed(2)}</p>
          <p>VAT: KSH 0.00</p> {/* Update VAT calculation */}
          <h4>TOTAL: KSH {Number(totalAmount || 0).toFixed(2)}</h4>
          <p>Payment Method: {paymentMethod}</p>
          <p>ITEMS NUMBER: {cart.length}</p>
        </div>
      </div>

      <div className="footer">
        <p>Date: {currentDateTime}</p>
        <p>SCU ID: {kraDetails.scuId}</p>
        <p>CU INVOICE No.: {kraDetails.scuId}/{transactionId}</p>
        <p>Receipt Signature: {kraDetails.signature}</p>
        <div className="qr-code">
          <img src="https://via.placeholder.com/100" alt="QR Code" /> {/* Placeholder for QR Code */}
        </div>
        <p>Receipt Number: {kraDetails.receiptNumber}</p>
      </div>
    </div>
  );
});

export default Receipt;
