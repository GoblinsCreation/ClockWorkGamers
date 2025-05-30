import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Web3Provider as EthersWeb3Provider } from '@ethersproject/providers';
import { formatEther } from '@ethersproject/units';
import { useToast } from './use-toast';

type Web3ContextType = {
  account: string | null;
  chainId: number | null;
  provider: any | null;
  signer: any | null;
  balance: string;
  connecting: boolean;
  connected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
};

const Web3Context = createContext<Web3ContextType | null>(null);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<any | null>(null);
  const [signer, setSigner] = useState<any | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [connecting, setConnecting] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  const { toast } = useToast();

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast({
        title: "Metamask not found",
        description: "Please install Metamask browser extension to connect",
        variant: "destructive",
      });
      return;
    }

    try {
      setConnecting(true);
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const ethProvider = new EthersWeb3Provider(window.ethereum);
      const ethSigner = ethProvider.getSigner();
      const network = await ethProvider.getNetwork();
      const ethBalance = await ethProvider.getBalance(accounts[0]);
      
      setAccount(accounts[0]);
      setChainId(network.chainId);
      setProvider(ethProvider);
      setSigner(ethSigner);
      setBalance(formatEther(ethBalance));
      setConnected(true);
      
      toast({
        title: "Wallet connected",
        description: "Successfully connected to your wallet",
      });
    } catch (error: any) {
      console.error('Error connecting to wallet:', error);
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect to wallet",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  }, [toast]);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setChainId(null);
    setProvider(null);
    setSigner(null);
    setBalance('0');
    setConnected(false);
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected",
    });
  }, [toast]);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (connected) {
          setAccount(accounts[0]);
          // Update balance for new account
          if (provider) {
            provider.getBalance(accounts[0]).then((newBalance: any) => {
              setBalance(formatEther(newBalance));
            });
          }
        }
      };

      const handleChainChanged = (chainId: string) => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        // Different wallet providers use different methods to remove listeners
        // Try both removeListener and off methods for better compatibility
        try {
          if (window.ethereum.removeListener) {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            window.ethereum.removeListener('chainChanged', handleChainChanged);
          } else if (window.ethereum.off) {
            window.ethereum.off('accountsChanged', handleAccountsChanged);
            window.ethereum.off('chainChanged', handleChainChanged);
          }
        } catch (error) {
          console.error('Error removing wallet event listeners:', error);
        }
      };
    }
  }, [connected, disconnectWallet, provider]);

  return (
    <Web3Context.Provider
      value={{
        account,
        chainId,
        provider,
        signer,
        balance,
        connecting,
        connected,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}

// Add ethereum to the window object for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}