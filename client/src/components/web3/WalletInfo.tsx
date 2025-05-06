import React from 'react';
import { useWeb3 } from '@/lib/web3/Web3Provider';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, AlertCircle, ExternalLink } from 'lucide-react';

interface WalletInfoProps {
  showDisconnect?: boolean;
  className?: string;
}

export function WalletInfo({ showDisconnect = true, className = '' }: WalletInfoProps) {
  const { address, balance, chainId, network, isConnected, disconnectWallet } = useWeb3();
  
  if (!isConnected || !address) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle>Wallet Not Connected</CardTitle>
          <CardDescription>
            Connect your wallet to view your account information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <AlertCircle className="w-10 h-10 text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Format wallet address
  const formatAddress = (address: string) => {
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };
  
  // Get network name and color
  const getNetworkInfo = () => {
    if (!chainId) return { name: 'Unknown', color: 'gray' };
    
    switch (chainId) {
      case 1:
        return { name: 'Ethereum Mainnet', color: 'blue' };
      case 137:
        return { name: 'Polygon', color: 'purple' };
      case 80001:
        return { name: 'Polygon Mumbai', color: 'indigo' };
      case 42161:
        return { name: 'Arbitrum', color: 'blue' };
      default:
        return { name: network || 'Unknown', color: 'gray' };
    }
  };
  
  const networkInfo = getNetworkInfo();
  
  // Generate Etherscan link
  const getEtherscanLink = () => {
    if (!address) return '#';
    
    let baseUrl = 'https://etherscan.io';
    if (chainId === 137) {
      baseUrl = 'https://polygonscan.com';
    } else if (chainId === 80001) {
      baseUrl = 'https://mumbai.polygonscan.com';
    } else if (chainId === 42161) {
      baseUrl = 'https://arbiscan.io';
    }
    
    return `${baseUrl}/address/${address}`;
  };
  
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Wallet Info</CardTitle>
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Check className="w-3 h-3 mr-1" /> Connected
          </Badge>
        </div>
        <CardDescription>
          Your connected wallet details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm font-medium mb-1">Address</div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">{formatAddress(address)}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={() => {
                navigator.clipboard.writeText(address);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
            </Button>
          </div>
        </div>
        
        <div>
          <div className="text-sm font-medium mb-1">Network</div>
          <Badge variant="outline" className={`bg-${networkInfo.color}-100 text-${networkInfo.color}-800 border-${networkInfo.color}-200`}>
            {networkInfo.name}
          </Badge>
        </div>
        
        {balance && (
          <div>
            <div className="text-sm font-medium mb-1">Balance</div>
            <div className="font-mono">{parseFloat(balance).toFixed(4)} ETH</div>
          </div>
        )}
      </CardContent>
      
      {showDisconnect && (
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={disconnectWallet}
          >
            Disconnect Wallet
          </Button>
          
          <a 
            href={getEtherscanLink()} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Explorer
            </Button>
          </a>
        </CardFooter>
      )}
    </Card>
  );
}