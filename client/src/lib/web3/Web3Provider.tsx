import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { 
  createClient,
  configureChains,
  mainnet, 
  WagmiConfig,
  Chain 
} from 'wagmi';
import { polygon, polygonMumbai, arbitrum } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { apiRequest } from '../queryClient';

// Define supported chains
const supportedChains = [mainnet, polygon, polygonMumbai, arbitrum];

// Configure chains & providers
const { chains, provider, webSocketProvider } = configureChains(
  supportedChains,
  [publicProvider()],
);

// Set up client
const client = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'ClockWork Gamers',
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: 'clockwork-gamers',
      },
    }),
  ],
  provider,
  webSocketProvider,
});

// Create context for Web3 state
interface Web3ContextType {
  address: string | null;
  balance: string | null;
  chainId: number | null;
  connectWallet: (connectorId: string) => Promise<void>;
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

export function Web3Provider({ children }: Web3ProviderProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [network, setNetwork] = useState<string | null>(null);

  // Function to connect to a wallet
  const connectWallet = async (connectorId: string) => {
    try {
      setIsConnecting(true);
      setError(null);

      // Check if ethereum is available
      if (typeof window.ethereum === 'undefined') {
        throw new Error('No Ethereum browser extension detected. Please install MetaMask.');
      }

      // Create ethers provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Request account access
      const accounts = await provider.send('eth_requestAccounts', []);
      const userAddress = accounts[0];
      setAddress(userAddress);
      
      // Get network
      const network = await provider.getNetwork();
      setChainId(network.chainId);
      setNetwork(network.name);
      
      // Get balance
      const balance = await provider.getBalance(userAddress);
      setBalance(ethers.utils.formatEther(balance));
      
      // Save wallet address to user profile if logged in
      try {
        await apiRequest('PUT', '/api/profile', {
          walletAddress: userAddress
        });
      } catch (err) {
        console.error('Failed to save wallet address:', err);
      }
      
      setIsConnected(true);
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAddress(accounts[0]);
        }
      });
      
      // Listen for chain changes
      window.ethereum.on('chainChanged', (chainId: string) => {
        window.location.reload();
      });
      
    } catch (err: any) {
      console.error('Error connecting to wallet:', err);
      setError(err);
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
      <WagmiConfig client={client}>
        {children}
      </WagmiConfig>
    </Web3Context.Provider>
  );
}