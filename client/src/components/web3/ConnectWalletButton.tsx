import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWeb3 } from '@/lib/web3/Web3Provider';
import { Wallet, AlertCircle, Plus, Check, ExternalLink } from 'lucide-react';
import { FaEthereum } from 'react-icons/fa';
import { SiOpera, SiBrave } from 'react-icons/si';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { ethers } from 'ethers';

type WalletOption = {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const walletOptions: WalletOption[] = [
  {
    id: 'ethereum',
    name: 'MetaMask',
    icon: <FaEthereum className="w-8 h-8 text-orange-500" />,
    description: 'Connect to your MetaMask or other Ethereum wallet'
  },
  {
    id: 'brave',
    name: 'Brave Wallet',
    icon: <SiBrave className="w-8 h-8 text-orange-600" />,
    description: 'Connect using Brave browser wallet'
  },
  {
    id: 'opera',
    name: 'Opera Wallet',
    icon: <SiOpera className="w-8 h-8 text-red-600" />,
    description: 'Connect using Opera browser wallet'
  }
];

export function ConnectWalletButton() {
  const { 
    address, 
    balance, 
    chainId, 
    connectWallet, 
    disconnectWallet, 
    isConnecting, 
    isConnected, 
    error,
    network
  } = useWeb3();
  
  const [open, setOpen] = useState(false);
  
  // Function to truncate address for display
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  // Handler for wallet selection
  const handleWalletSelect = async (walletId: string) => {
    try {
      await connectWallet(walletId);
      setOpen(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {isConnected ? (
            <Button variant="outline" className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-blue-600 text-white hover:from-orange-600 hover:to-blue-700 border-none">
              <div className="flex items-center">
                <Wallet className="w-4 h-4 mr-2" />
                <span>{truncateAddress(address!)}</span>
                {balance && (
                  <Badge variant="outline" className="ml-2 bg-black/20 text-white">
                    {parseFloat(balance).toFixed(4)} ETH
                  </Badge>
                )}
              </div>
            </Button>
          ) : (
            <Button className="bg-gradient-to-r from-orange-500 to-blue-600 text-white hover:from-orange-600 hover:to-blue-700">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          )}
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isConnected ? 'Wallet Connected' : 'Connect Your Wallet'}</DialogTitle>
            <DialogDescription>
              {isConnected 
                ? 'Your wallet is connected to ClockWork Gamers' 
                : 'Connect your wallet to access Web3 features including NFT rentals, token purchases, and more.'}
            </DialogDescription>
          </DialogHeader>
          
          {isConnected ? (
            <div className="space-y-4 py-4">
              <div className="flex flex-col space-y-2 rounded-lg border p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Connected Address</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    <Check className="w-3 h-3 mr-1" /> Connected
                  </Badge>
                </div>
                <div className="flex items-center">
                  <span className="font-mono text-sm">{address}</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="ml-2 h-6 w-6 p-0"
                          onClick={() => {
                            navigator.clipboard.writeText(address || '');
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                          </svg>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy address</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                {network && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-medium">Network</span>
                    <Badge variant="outline" className="capitalize">
                      {network}
                    </Badge>
                  </div>
                )}
                
                {balance && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-medium">Balance</span>
                    <span className="font-mono text-sm">{parseFloat(balance).toFixed(4)} ETH</span>
                  </div>
                )}
                
                <div className="flex justify-between mt-4">
                  <Button variant="outline" size="sm" className="w-1/2 mr-2" onClick={disconnectWallet}>
                    Disconnect
                  </Button>
                  <a 
                    href={`https://etherscan.io/address/${address}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-1/2"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on Etherscan
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 mt-0.5" />
                  <div>
                    <p className="font-medium">Connection Error</p>
                    <p className="text-sm">{error.message}</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                {walletOptions.map((wallet) => (
                  <div 
                    key={wallet.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:border-orange-500 cursor-pointer transition-colors"
                    onClick={() => handleWalletSelect(wallet.id)}
                  >
                    <div className="flex items-center space-x-4">
                      {wallet.icon}
                      <div>
                        <p className="font-medium">{wallet.name}</p>
                        <p className="text-sm text-gray-500">{wallet.description}</p>
                      </div>
                    </div>
                    <Plus className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                By connecting your wallet, you agree to the ClockWork Gamers Terms of Service and Privacy Policy
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}