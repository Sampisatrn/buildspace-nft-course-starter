import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import { useLoading, Audio } from '@agney/react-loading';
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import myEpicNft from './utils/MyEpicNFT.json';

const TWITTER_HANDLE = 'Samp_strn';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/sampinft-zkdx4yxfs2';
const TOTAL_MINT_COUNT = 100;

// I moved the contract address to the top for easy access.
const CONTRACT_ADDRESS = "0x85672aae0e4F27414Da09881F11BfEE1AdbCa0D8";


const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [loading, setLoading ] = useState(false);
  
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("Connected to chain " + chainId);
    
    // String, hex code of the chainId of the Rinkebey test network
    const rinkebyChainId = "0x4"; 
    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network!");
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account)
      setupEventListener()
    } else {
      console.log("No authorized account found")
    }
  }

  /*
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
  
      /*
      * Fancy method to request access to account.
      */
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      /*
      * Boom! This should print out public address once we authorize Metamask.
      */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      setupEventListener() 
    } catch (error) {
      console.log(error)
    }
  }



// Setup our listener.
const setupEventListener = async () => {
  // Most of this looks the same as our function askContractToMintNft
  try {
    const { ethereum } = window;

    if (ethereum) {
      // Same stuff again
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

      // THIS IS THE MAGIC SAUCE.
      // This will essentially "capture" our event when our contract throws it.
      // If you're familiar with webhooks, it's very similar to that!
      connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
        console.log(from, tokenId.toNumber())
        alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
      });

      console.log("Setup event listener!")

    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error)
  }
}

  const askContractToMintNft = async () => {
   
  
    try {
      const { ethereum } = window;
  
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
  
        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();
  
        console.log("Mining...please wait.")
        setLoading(true);
        await nftTxn.wait();
        
        console.log(nftTxn);
        // eslint-disable-next-line no-template-curly-in-string
        console.log("Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}");
        setLoading(false);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const renderMintUI = () => (
    <div>
    <button onClick={ askContractToMintNft } className="cta-button connect-wallet-button">
      Mint NFT
    </button>
    <br /><br />
    <a href={`https://testnets.opensea.io/${currentAccount}`} style={{color:"white"}}>Check your NFTs</a>
    </div>
  )

  const loadingAnim = () => (
    <div>

    <svg version="1.1" id="L1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="50" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xmlSpace="preserve">
        <circle fill="none" stroke="#fff"  stroke-width="5" stroke-miterlimit="15" stroke-dasharray="14.2472,14.2472" cx="50" cy="50" r="47" >
          <animateTransform 
            attributeName="transform" 
            attributeType="XML" 
            type="rotate"
            dur="5s" 
            from="0 50 50"
            to="360 50 50" 
            repeatCount="indefinite" />
      </circle>
      </svg>
          <p className="sub-text">
    Minting in progress
    </p>
      </div>
  )
  /*
  * Added a conditional render! We don't want to show Connect to Wallet if we're already connected :).
  */
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? renderNotConnectedContainer() : 
            loading === true ? loadingAnim() : renderMintUI()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
          <a
              className="footer-text"
              href={OPENSEA_LINK}
              target="_blank"
              rel="noreferrer"
            >
            {`  🌊 View Collection on OpenSea`}
            </a>
        </div>
      </div>
    </div>
  );
};

export default App;