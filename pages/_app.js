import {
    EthereumClient,
    w3mConnectors,
    w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { useEffect, useState } from "react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { mainnet, bsc, bscTestnet } from "wagmi/chains";
import "../src/styles/global.css";
import "@fontsource/roboto";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/400-italic.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import jwt_decode from "jwt-decode";
  
  // 1. Get projectID at https://cloud.walletconnect.com
  if (!process.env.NEXT_PUBLIC_PROJECT_ID) {
    throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
  }
  const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

  
  // 2. Configure wagmi client
  var chains = [bscTestnet, mainnet];
  
  // 4. Wrap your app with WagmiProvider and add <Web3Modal /> compoennt
  export default function App({ Component, pageProps }) {
    const [ready, setReady] = useState(false);
    
  
    useEffect(() => {
      setReady(true);
    }, []);

    const [urlParams, setUrlParams] = useState();
    const [WooCryptAPI, setWooCryptAPI] = useState();
    const [decoded, setDecoded] = useState();

    useEffect(() => {
      const urlIntParams = new URLSearchParams(window.location.search)
      setUrlParams(urlIntParams);
      const WooAPI = new WooCommerceRestApi({
        url: "http://woocrypt.com",
        consumerKey: "ck_8198ea364238b2b36ecbd42b7f01c60894ae862d",
        consumerSecret: "cs_3ac6ee7e3124cb3f17208426dff4e2d49d0dcf7b",
        version: "wc/v3"
      });
      var JWTdecoded;
      const APIKey = urlIntParams?.get('api_key');
      try {
        JWTdecoded = jwt_decode(APIKey);
        
      } catch (error) {
        console.error('Token verification failed:', error);
      }
      setDecoded(JWTdecoded)
      setWooCryptAPI(WooAPI)
    
       
     }, []);

    pageProps.userData = decoded;
    console.log(decoded)
    const tokenId = urlParams?.get('token_id');
    pageProps.dollarAmount = urlParams?.get('amount');
    pageProps.receiverAddress = urlParams?.get('receiver');
    pageProps.isErc20 = urlParams?.get('isErc20');
    pageProps.abi = urlParams?.get('abi');
    const [chain, tokenAddress] = tokenId?.split('_') ?? [];
    pageProps.TokenChain = chain;
    pageProps.tokenAddress = tokenAddress;
    pageProps.feeAddress = process.env.NEXT_PUBLIC_FEE_ADDRESS;
    const callBack = urlParams?.get('callback');
    pageProps.orderId = urlParams?.get('order_id');
    pageProps.redirectURL = urlParams?.get('redirect_page');
    const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
    const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: w3mConnectors({ chains, projectId }),
    publicClient,
    });
      
      // 3. Configure modal ethereum client
    const ethereumClient = new EthereumClient(wagmiConfig, chains);

    
   if(callBack){

   } else {
      return (
        <>
          {ready ? (
            <WagmiConfig config={wagmiConfig}>
              <Component {...pageProps} />
            </WagmiConfig>
          ) : null}
    
          <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
        </>
      );
   }
  
    
  }