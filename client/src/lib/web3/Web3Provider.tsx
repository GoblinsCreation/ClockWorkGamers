import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { apiRequest } from '../queryClient';

// Create context for Web3 state
interface Web3ContextType {
  address: string | null;
  balance: string | null;
  chainId: number | null;
  connectWallet: (walletType: string) => Promise<void>;
  disconnectWallet: () => void;
  isConnecting: boolean;
  isConnected: boolean;
  error: Error | null;
  network: string | null;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}

interface Web3ProviderProps {
  children: ReactNode;
}

// Helper function to get network name from chain ID
function getNetworkName(chainId: number): string {
  const networks: Record<number, string> = {
    1: 'Ethereum Mainnet',
    5: 'Goerli Testnet',
    11155111: 'Sepolia Testnet',
    137: 'Polygon Mainnet',
    80001: 'Polygon Mumbai',
    42161: 'Arbitrum One',
    421613: 'Arbitrum Goerli'
  };
  
  return networks[chainId] || `Chain ID: ${chainId}`;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          // Check if we're already connected
          const ethProvider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await ethProvider.listAccounts();
          
          if (accounts.length > 0) {
            const userAddress = accounts[0].address;
            setAddress(userAddress);
            
            const network = await ethProvider.getNetwork();
            setChainId(Number(network.chainId));
            setNetwork(getNetworkName(Number(network.chainId)));
            
            const balance = await ethProvider.getBalance(userAddress);
            setBalance(ethers.formatEther(balance));
            
            setProvider(ethProvider);
            setIsConnected(true);
          }
        } catch (err) {
          console.error("Error checking initial connection:", err);
        }
      }
    };
    
    checkConnection();
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined' && isConnected) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAddress(accounts[0]);
          if (provider) {
            const balance = await provider.getBalance(accounts[0]);
            setBalance(ethers.formatEther(balance));
          }
        }
      };
      
      const handleChainChanged = (_chainId: string) => {
        // Convert chainId from hex to decimal
        const newChainId = parseInt(_chainId, 16);
        setChainId(newChainId);
        setNetwork(getNetworkName(newChainId));
        
        // Reload the page to ensure all state is fresh with the new network
        window.location.reload();
      };
      
      const handleDisconnect = () => {
        disconnectWallet();
      };
      
      // Subscribe to events
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);
      
      // Cleanup function
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      };
    }
  }, [isConnected, provider]);

  // Function to connect to a wallet
  const connectWallet = async (walletType: string) => {
    try {
      setIsConnecting(true);
      setError(null);

      // Check if ethereum is available
      if (typeof window.ethereum === 'undefined') {
        throw new Error('No Ethereum browser extension detected. Please install MetaMask.');
      }

      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethProvider);
      
      // Request account access
      const accounts = await ethProvider.send('eth_requestAccounts', []);
      const userAddress = accounts[0];
      setAddress(userAddress);
      
      // Get network information
      const network = await ethProvider.getNetwork();
      const chainId = Number(network.chainId);
      setChainId(chainId);
      setNetwork(getNetworkName(chainId));
      
      // Get balance
      const balance = await ethProvider.getBalance(userAddress);
      setBalance(ethers.formatEther(balance));
      
      // Save wallet address to user profile if logged in
      try {
        await apiRequest('PUT', '/api/profile', {
          walletAddress: userAddress
        });
      } catch (err) {
        console.error('Failed to save wallet address:', err);
      }
      
      setIsConnected(true);
      
    } catch (err: any) {
      console.error('Error connecting to wallet:', err);
      setError(err instanceof Error ? err : new Error(err.message || 'Unknown error connecting wallet'));
    } finally {
      setIsConnecting(false);
    }
  };

  // Function to disconnect wallet
  const disconnectWallet = () => {
    setAddress(null);
    setBalance(null);
    setChainId(null);
    setNetwork(null);
    setIsConnected(false);
    setProvider(null);
  };

  // Provide the Web3 context to children
  const contextValue: Web3ContextType = {
    address,
    balance,
    chainId,
    connectWallet,
    disconnectWallet,
    isConnecting,
    isConnected,
    error,
    network
  };

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  );
}