import React, { createContext, useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';

// Create wallet context
const WalletContext = createContext();

// Provide wallet context
const WalletProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Wallet connection function
  const connectWallet = async () => {
    try {
      setError(null);
      
      // Check if browser supports EIP-1193
      if (window.ethereum) {
        // Request account access
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        // Create provider
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await web3Provider.getSigner();
        const chainId = await signer.provider.getNetwork().then(network => network.chainId);
        
        // Update state
        setProvider(web3Provider);
        setSigner(signer);
        setAccount(accounts[0]);
        setChainId(chainId);
        setIsConnected(true);
        
        return accounts[0];
      } else {
        throw new Error('Please install MetaMask or another Web3 wallet');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Disconnect wallet (clear state)
  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
  };

  // Listen for account and network changes
  useEffect(() => {
    if (window.ethereum) {
      // Listen for account changes
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        } else {
          disconnectWallet();
        }
      };

      // Listen for network changes
      const handleChainChanged = (chainId) => {
        setChainId(parseInt(chainId, 16));
      };

      // Listen for disconnection
      const handleDisconnect = () => {
        disconnectWallet();
      };

      // Add event listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);

      // Check if already connected
      window.ethereum.request({
        method: 'eth_accounts',
      }).then((accounts) => {
        if (accounts.length > 0) {
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          web3Provider.getSigner().then(signer => {
            setSigner(signer);
            setProvider(web3Provider);
          });
          setAccount(accounts[0]);
          setIsConnected(true);
          // Get current chain ID
          window.ethereum.request({ method: 'eth_chainId' }).then(id => {
            setChainId(parseInt(id, 16));
          });
        }
      });

      // Clean up event listeners
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      };
    }
  }, []);

  // Switch network to Sepolia testnet
  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chainId in hex
      });
    } catch (error) {
      // If chain doesn't exist, add it
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0xaa36a7',
              chainName: 'Sepolia Testnet',
              nativeCurrency: {
                name: 'Sepolia Ether',
                symbol: 'SEP',
                decimals: 18,
              },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io/'],
            },
          ],
        });
      } else {
        throw error;
      }
    }
  };

  // Context value
  const value = {
    provider,
    signer,
    account,
    chainId,
    isConnected,
    error,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to use wallet context
const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export { WalletProvider, useWallet };