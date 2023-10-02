import React, {useEffect, useState} from 'react';
import { Web3Button, useWeb3Modal } from '@web3modal/react';
import {useAccount, erc20ABI, useSwitchNetwork, useNetwork, useBalance } from 'wagmi'
import { ethers } from 'ethers'
import axios from 'axios';
import Swal from 'sweetalert2'
import { useEthersSigner } from './components/ethers'
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import RecapOrder from './order_recap';
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";


const HandlePayment = ({tokenAddress,TokenChain,dollarAmount,isErc20,receiverAddress,abi,feeAddress,orderId,redirectURL,userData}) => {
  const [tokenAmount, setTokenAmount] = useState();
  const [isLoadingCustom, setLoading] = useState(false);
  const { address, isConnecting, isDisconnected } = useAccount()
  const { open, close } = useWeb3Modal()
  const signer = useEthersSigner()
  const { switchNetwork } = useSwitchNetwork()
  const { chain } = useNetwork()
  const { data, isError, isLoading } = useBalance({
    address: address,
})
const WooCryptApi = new WooCommerceRestApi({
  url: "http://woocrypt.com",
  consumerKey: "ck_8198ea364238b2b36ecbd42b7f01c60894ae862d",
  consumerSecret: "cs_3ac6ee7e3124cb3f17208426dff4e2d49d0dcf7b",
  version: "wc/v3"
});
const order_data = {
  set_paid: true,
  billing: {
      first_name: userData?.username,
      email: userData?.email,
  },
  line_items: [],
  total: dollarAmount,
  meta_data: [
      {
          key: "custom_order_id",
          value: orderId
      },
      {
        key: "custom_user_id",
        value: userData?.user_id
    }
  ]
}
  if(tokenAddress==='internal' && TokenChain==='bsc'){
    console.log('Case 1')
    useEffect( () => {
      async function priceData() {
      const priceData = await axios.get(`https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=binancecoin`);
      const tokenPrice = priceData?.data['binancecoin']?.usd;
      setTokenAmount(dollarAmount / tokenPrice);
      }
      priceData();
      },[]);

      const handlePayment = async () => {
        const userBalance = data?.value
        const amountToPay = ethers.parseUnits(tokenAmount.toFixed(18),18)
        const feeAmount = amountToPay/BigInt(1000);
        const taxedAmount = amountToPay-feeAmount;
        if(userBalance < amountToPay){
          Swal.fire({
            icon: 'error',
            title: 'Insufficient funds',
            text: 'You do not have enough funds to complete this transaction',
          });
        } else {
        await signer.sendTransaction({
            to: feeAddress,
            value: feeAmount,
        }).then(async (tx)=>{
          setLoading(true)
          await tx.wait().then(async ()=>{
            await signer.sendTransaction({
              to: receiverAddress,
              value: taxedAmount,
            }).then(async (tx)=>{
              await tx.wait().then(async () => {
                Swal.fire({
                  icon: 'success',
                  title: 'Transaction completed <br>' +
                  'Thank you for your purchase',
                });
                setLoading(false)
                WooCryptApi.post("orders", order_data)
                .then((response) => {
                  console.log(response.data);
                })
                .catch((error) => {
                  console.log(error.response.data);
                });
              }).catch((error) =>{
                setLoading(false)
                Swal.fire({
                  icon: 'error',
                  title: 'Something went wrong',
                  text: 'The transaction failed, please try again',
                });
              })
            }).catch((error) =>{
              setLoading(false)
              Swal.fire({
                icon: 'error',
                title: 'Something went wrong',
                text: 'The transaction failed, please try again',
              });
            })
          }).catch((error) =>{
            setLoading(false)
            Swal.fire({
              icon: 'error',
              title: 'Something went wrong',
              text: 'The transaction failed during the processing, please try again',
            });
          })
        }).catch((error) =>{
          setLoading(false)
          Swal.fire({
            icon: 'error',
            title: 'Something went wrong',
            text: 'The transaction failed in client, please try again',
          });
        })
      }};
      
      return (
        <>
        <div className='d-grid gap-2'>
          
        <Button variant="primary" onClick={()=>open()} size="lg" >
          {!isDisconnected ? 'Connected' :  'Connect your wallet'}
        </Button>

        <RecapOrder dollarAmount={dollarAmount} address={address}/>

        {isDisconnected ? null : chain?.id!=97 ? <Button variant="primary" onClick={()=> switchNetwork(97)} size="lg" >Change your network</Button> : isLoadingCustom ? <Button variant="primary" disabled>
            <Spinner
              as="span"
              animation="grow"
              size="sm"
              role="status"
              aria-hidden="true"
            />
            Loading...
          </Button> : <Button variant="primary" onClick={handlePayment} size="lg" >Pay</Button>}
          
        </div>
            
        </>
        
      );
  } else if(tokenAddress==='internal' && TokenChain==='eth'){
    console.log('Case 2')
    useEffect( () => {
      async function priceData(){
        const priceData = await axios.get(`https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=ethereum`);
        const tokenPrice = priceData?.data['ethereum']?.usd;
        setTokenAmount(dollarAmount / tokenPrice);
      }
      priceData()
    },[]);
    
      const handlePayment = async () => {
        const userBalance = data?.value
        const amountToPay = ethers.parseUnits(tokenAmount.toFixed(18),18)
        const feeAmount = amountToPay/BigInt(1000);
        const taxedAmount = amountToPay-feeAmount;
        if(userBalance < amountToPay){
          Swal.fire({
            icon: 'error',
            title: 'Insufficient funds',
            text: 'You do not have enough funds to complete this transaction',
          });
        } else {
        await signer.sendTransaction({
            to: receiverAddress,
            value: taxedAmount,
        }).then(async (tx)=>{
          setLoading(true)
          await tx.wait().then(async ()=>{
            await signer.sendTransaction({
              to: feeAddress,
              value: feeAmount,
            }).then(async (tx)=>
            await tx.wait().then(async () => {
              setLoading(false)
              Swal.fire({
                icon: 'success',
                title: 'Transaction completed <br>' +
                'Thank you for your purchase',
              });
              fetch(`${callBackURL}?order_id=${orderId}`)
                .then(response => response.json())
                .then(data => {
                  // Handle the response data here
                  console.log(data);
                  window.location.href = redirectURL;
                })
                .catch(error => {
                  console.error(error);
                });
            }).catch((error) =>{
              setLoading(false)
              Swal.fire({
                icon: 'error',
                title: 'Something went wrong',
                text: 'The transaction failed, please try again',
              });
            })
            ).catch((error) =>{
              setLoading(false)
              Swal.fire({
                icon: 'error',
                title: 'Something went wrong',
                text: 'The transaction failed, please try again',
              });
            })
          }).catch((error) =>{
            setLoading(false)
            Swal.fire({
              icon: 'error',
              title: 'Something went wrong',
              text: 'The transaction failed, please try again',
            });
          })
        }).catch((error) =>{
          setLoading(false)
          Swal.fire({
            icon: 'error',
            title: 'Something went wrong',
            text: 'The transaction failed, please try again',
          });
        })
      }};
      return (
        <>
        <div className='d-grid gap-2'>
          
        <Button variant="primary" onClick={()=>open()} size="lg" >
          {!isDisconnected ? 'Connected' :  'Connect your wallet'}
        </Button>

        <RecapOrder dollarAmount={dollarAmount} address={address}/>

        {isDisconnected ? null : chain?.id!=1 ? <Button variant="primary" onClick={()=> switchNetwork(1)} size="lg" >Change your network</Button> : isLoadingCustom ? <Button variant="primary" disabled>
            <Spinner
              as="span"
              animation="grow"
              size="sm"
              role="status"
              aria-hidden="true"
            />
            Loading...
          </Button> : <Button variant="primary" onClick={handlePayment} size="lg" >Pay</Button>}
          
        </div>
            
        </>
        
      );
      
  }else if (tokenAddress!=='internal' && isErc20==='true'){
    console.log('Case 3')
    var chain_platform_id;
    var chainId;
    if(TokenChain==='bsc'){
      chain_platform_id = 'binance-smart-chain'
      chainId = 56
    } else {
      chain_platform_id = 'ethereum'
      chainId = 1
    }
    useEffect( () => {
      async function priceData(){
        const lowerCaseTokenAddress = tokenAddress.toLowerCase();
        const priceData = await axios.get(`https://api.coingecko.com/api/v3/simple/token_price/${chain_platform_id}?contract_addresses=${tokenAddress}&vs_currencies=usd`);
        const tokenPrice = priceData.data[lowerCaseTokenAddress]?.usd;
        setTokenAmount(dollarAmount / tokenPrice);
      }
      priceData()
    },[tokenAddress]);

      
    const handlePayment = async () => {
        console.log('Button Pressed')
        const amountToPay = ethers.parseUnits(tokenAmount.toFixed(18),18)
        const feeAmount = amountToPay/BigInt(1000);
        const taxedAmount = amountToPay-feeAmount;
        console.log(ethers.formatEther(feeAmount))
        console.log(ethers.formatEther(amountToPay))
        console.log(ethers.formatEther(taxedAmount))
        console.log(address)
        const contract = new ethers.Contract(tokenAddress, erc20ABI, signer)
        await contract.balanceOf(address).then(async (userBalance) => {
          console.log(ethers.formatEther(userBalance))
          if(userBalance < amountToPay){
            Swal.fire({
              icon: 'error',
              title: 'Insufficient funds',
              text: 'You do not have enough funds to complete this transaction',
            });
          } else {
            await contract.transfer(feeAddress, feeAmount).then(async (tx) => {
              setLoading(true)
              console.log('awaiting transfer of fees')
              await tx.wait().then(async () => {
                console.log('amount transfered')
                await contract.transfer(receiverAddress, taxedAmount).then(async (tx) => {
                  console.log('awaiting transfer of amount')
                  await tx.wait().then(async () => {
                    Swal.fire({
                      icon: 'success',
                      title: 'Transaction completed <br>' +
                      'Thank you for your purchase',
                    });
                    setLoading(false)
                    fetch(`${callBackURL}?order_id=${orderId}`)
                    .then(response => response.json())
                    .then(data => {
                      // Handle the response data here
                      console.log(data);
                      window.location.href = redirectURL;
                    })
                    .catch(error => {
                      console.error(error);
                    });
                  }
                  ).catch((error) =>{
                    setLoading(false)
                    Swal.fire({
                      icon: 'error',
                      title: 'Something went wrong',
                      text: 'The transaction failed, please try again',
                    });
                  }
                  )
                }
                ).catch( (error) =>{
                  setLoading(false)
                  Swal.fire({
                    icon: 'error',
                    title: 'Something went wrong',
                    text: 'The transaction failed, please try again',
                  });
                }
                )
              }
              ).catch( (error) =>{
                setLoading(false)
                Swal.fire({
                  icon: 'error',
                  title: 'Something went wrong',
                  text: 'The transaction failed, please try again',
                });
              }
              )
            }
            ).catch( (error) =>{
              setLoading(false)
              Swal.fire({
                icon: 'error',
                title: 'Something went wrong',
                text: 'The transaction failed, please try again',
              });
            }
            )
          }
        })
        
      };
      return (
        <>
        <div className='d-grid gap-2'>
          
        <Button variant="primary" onClick={()=>open()} size="lg" >
          {!isDisconnected ? 'Connected' :  'Connect your wallet'}
        </Button>

        <RecapOrder dollarAmount={dollarAmount} address={address}/>

        {isDisconnected ? null : chain?.id!=chainId ? <Button variant="primary" onClick={()=> switchNetwork(chainId)} size="lg" >Change your network</Button> : isLoadingCustom ? <Button variant="primary" disabled>
            <Spinner
              as="span"
              animation="grow"
              size="sm"
              role="status"
              aria-hidden="true"
            />
            Loading...
          </Button> : <Button variant="primary" onClick={handlePayment} size="lg" >Pay</Button>}
          
        </div>
            
        </>
        
      );
      
  } else {
    console.log('Case 4')

    var chain_platform_id;
    var chainId;
    if(TokenChain==='bsc'){
      chain_platform_id = 'binance-smart-chain'
      chainId = 56
    } else {
      chain_platform_id = 'ethereum'
      chainId = 1
    }
    useEffect( () => {
      async function priceData(){
        const lowerCaseTokenAddress = tokenAddress.toLowerCase();
        const priceData = await axios.get(`https://api.coingecko.com/api/v3/simple/token_price/${chain_platform_id}?contract_addresses=${tokenAddress}&vs_currencies=usd`);
        const tokenPrice = priceData.data[lowerCaseTokenAddress]?.usd;
        setTokenAmount(dollarAmount / tokenPrice);
      }
      priceData()
    },[tokenAddress]);

      
    const handlePayment = async () => {
        console.log('Button Pressed')
        const amountToPay = ethers.parseUnits(tokenAmount.toFixed(18),18)
        const feeAmount = amountToPay/BigInt(1000);
        const taxedAmount = amountToPay-feeAmount;
        console.log(ethers.formatEther(feeAmount))
        console.log(ethers.formatEther(amountToPay))
        console.log(ethers.formatEther(taxedAmount))
        console.log(address)
        const contract = new ethers.Contract(tokenAddress, erc20ABI, signer)
        await contract.balanceOf(address).then(async (userBalance) => {
          console.log(ethers.formatEther(userBalance))
          if(userBalance < amountToPay){
            Swal.fire({
              icon: 'error',
              title: 'Insufficient funds',
              text: 'You do not have enough funds to complete this transaction',
            });
          } else {
            await contract.transfer(feeAddress, feeAmount).then(async (tx) => {
              setLoading(true)
              console.log('awaiting transfer of fees')
              await tx.wait().then(async () => {
                console.log('amount transfered')
                await contract.transfer(receiverAddress, taxedAmount).then(async (tx) => {
                  console.log('awaiting transfer of amount')
                  await tx.wait().then(async () => {
                    Swal.fire({
                      icon: 'success',
                      title: 'Transaction completed <br>' +
                      'Thank you for your purchase',
                    });
                    setLoading(false)
                    fetch(`${callBackURL}?order_id=${orderId}`)
                    .then(response => response.json())
                    .then(data => {
                      // Handle the response data here
                      console.log(data);
                      window.location.href = redirectURL;
                    })
                    .catch(error => {
                      console.error(error);
                    });
                  }
                  ).catch((error) =>{
                    setLoading(false)
                    Swal.fire({
                      icon: 'error',
                      title: 'Something went wrong',
                      text: 'The transaction failed, please try again',
                    });
                  }
                  )
                }
                ).catch( (error) =>{
                  setLoading(false)
                  Swal.fire({
                    icon: 'error',
                    title: 'Something went wrong',
                    text: 'The transaction failed, please try again',
                  });
                }
                )
              }
              ).catch( (error) =>{
                setLoading(false)
                Swal.fire({
                  icon: 'error',
                  title: 'Something went wrong',
                  text: 'The transaction failed, please try again',
                });
              }
              )
            }
            ).catch( (error) =>{
              setLoading(false)
              Swal.fire({
                icon: 'error',
                title: 'Something went wrong',
                text: 'The transaction failed, please try again',
              });
            }
            )
          }
        })
        
      };
      return (
        <>
        <div className='d-grid gap-2'>
          
        <Button variant="primary" onClick={()=>open()} size="lg" >
          {!isDisconnected ? 'Connected' :  'Connect your wallet'}
        </Button>

        <RecapOrder dollarAmount={dollarAmount} address={address}/>

        {isDisconnected ? null : chain?.id!=chainId ? <Button variant="primary" onClick={()=> switchNetwork(chainId)} size="lg" >Change your network</Button> : isLoadingCustom ? <Button variant="primary" disabled>
            <Spinner
              as="span"
              animation="grow"
              size="sm"
              role="status"
              aria-hidden="true"
            />
            Loading...
          </Button> : <Button variant="primary" onClick={handlePayment} size="lg" >Pay</Button>}
          
        </div>
            
        </>
        
      );
    
  }
  
};

export default HandlePayment;