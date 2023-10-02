import React from 'react';
import HandlePayment from './HandlePayment';

const PaymentPage = (props) => {
  return (
    <div style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <img src="/WooCrypt_logo_dark.png" alt="WooCrypt Logo" width="70%" />
        <HandlePayment {...props}/>
     </div>
  );
};

export default PaymentPage;