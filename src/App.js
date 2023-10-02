import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from "react";
// import { BuilderComponent, builder, useIsPreviewing } from "@builder.io/react";
import ethers from 'ethers';
import WalletConnectProvider from "@walletconnect/web3-provider";
import axios from 'axios';
// const API_KEY = '7901041ce3974fc794fa8f9b0dbfc0a2'
// builder.init(API_KEY);
const Payment = () => {
  const [provider, setProvider] = useState(null);
  const [connected, setConnected] = useState(false);

  const connectWallet = async () => {
    const wcProvider = new WalletConnectProvider({
      infuraId: "your-infura-id",
    });

    await wcProvider.enable();
    setProvider(new ethers.providers.Web3Provider(wcProvider));
    setConnected(true);
  };

  const handlePayment = async ({ dollarAmount, receiverAddress, tokenId, isErc20, abi }) => {
    const [chain, tokenAddress] = tokenId.split('_');
    const priceData = await axios.get(`https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${tokenAddress}`);
    const tokenPrice = priceData.data[tokenAddress].usd;
    const tokenAmount = dollarAmount / tokenPrice;

    const signer = provider.getSigner();
    const contract = new ethers.Contract(tokenAddress, abi, signer);

    if (isErc20) {
      const transferAmount = ethers.utils.parseUnits((tokenAmount * 0.999).toString(), 'ether');
      const feeAmount = ethers.utils.parseUnits((tokenAmount * 0.001).toString(), 'ether');
      await contract.transfer(receiverAddress, transferAmount);
      await contract.transfer('PlaceholderWalletAddress', feeAmount);
    } else {
      // handle non-ERC20 token
    }
  };

  return (
    <div style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <img src="WooCrypt_logo_dark.png" alt="WooCrypt Logo" />
      {!connected 
        ? <button onClick={connectWallet}>Connect Wallet</button> 
        : <button onClick={handlePayment}>Pay Now</button>}
    </div>
  );
};

export default Payment;

// export default function Page() {
//   const [homepage, setHomepage] = useState(null);

//   useEffect(() => {
//     builder
//       .get("homepage")
//       .toPromise()
//       .then((homepageData) => setHomepage(homepageData));
//   }, []);

//   return (
//     <>
//       {/* Put your header here. */}
//       {/* <YourHeader /> */}
//       {homepage && <BuilderComponent model="homepage" content={homepage} />}
//       {/* Put your footer here. */}
//       {/* <YourFooter /> */}
//     </>
//   );
// }