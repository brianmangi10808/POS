import React, { useState } from 'react';

function Category() {
  const [barcode, setBarcode] = useState('');

  // Handle the input from the barcode scanner
  const handleBarcodeInput = (e) => {
    setBarcode(e.target.value);

    // Log the barcode once it reaches a specific length (assuming it's 12 digits)
    if (e.target.value.length >= 12) { // You can adjust this based on your barcode length
      console.log('Scanned Barcode:', e.target.value);
      
      // Optional: You can also trigger additional actions, like fetching product details
      // fetchProductDetails(e.target.value);
    }
  };

  return (
    <div>
      <h2>Scan a Product</h2>
      <input
        type="text"
        value={barcode}
        onChange={handleBarcodeInput}
        placeholder="Scan barcode here"
        autoFocus
      />
      {/* Optionally display the barcode on the UI */}
      <p>Scanned Barcode: {barcode}</p>
    </div>
  );
}

export default Category;
