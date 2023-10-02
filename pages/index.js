import React, {useState,useEffect} from 'react';
import PaymentPage from './PaymentPage';

const App = (props) => {
  return (
    <div>
      <PaymentPage {...props}/>
    </div>
  );
};

export default App;