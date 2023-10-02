import React, { useEffect, useState } from "react";
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal,Web3Button } from '@web3modal/react'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { mainnet, bsc } from 'wagmi/chains'
import { useAccount, useContract } from 'wagmi'
import axios from 'axios';
var chains = [ ]
const projectId = '229a8bee75e264e172f5ece9db9ddafd'
const urlParams = new URLSearchParams(window.location.search);
const dollarAmount = urlParams.get('amount');
const receiverAddress = urlParams.get('receiver');
const tokenId = urlParams.get('token_id');
const isErc20 = urlParams.get('isErc20');
const abi = urlParams.get('abi');
const [chain, tokenAddress] = tokenId.split('_');
if(chain==='bsc'){
  chains = [ bsc ]
} else {
  chains = [ mainnet ]
}
function HomePage() {
  const handlePayment = async () => {
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
  <Web3Button />
  );
}
// const [provider, setProvider] = useState(null);
// const [connected, setConnected] = useState(false);

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient
})
const ethereumClient = new EthereumClient(wagmiConfig, chains)




const Payment = () => {
  
  return (
    <>
      <div style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src="/WooCrypt_logo_dark.png" alt="WooCrypt Logo" width="70%"/>
        <WagmiConfig config={wagmiConfig}>
          <HomePage />
        </WagmiConfig>

        <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
      </div>
    </>
    
  );
};

export default Payment;