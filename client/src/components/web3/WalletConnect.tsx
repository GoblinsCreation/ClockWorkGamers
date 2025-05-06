import { useState, useEffect } from 'react';
import { useWeb3 } from '@/lib/web3/Web3Provider';
import { Button } from '@/components/ui/button';
import { Wallet, ChevronDown, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatEthereumAddress } from '@/lib/utils';
import { isSupportedNetwork } from '@/lib/web3-utils';

export function WalletConnect() {
  const { isConnected, isConnecting, address, chainId, balance, connectWallet, disconnectWallet } = useWeb3();
  const [networkStatus, setNetworkStatus] = useState<'supported' | 'unsupported' | 'unknown'>('unknown');
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect if we're on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Check network support when chainId changes
  useEffect(() => {
    if (!chainId) {
      setNetworkStatus('unknown');
    } else if (isSupportedNetwork(chainId)) {
      setNetworkStatus('supported');
    } else {
      setNetworkStatus('unsupported');
    }
  }, [chainId]);

  if (!isConnected) {
    return (
      <Button 
        variant="outline" 
        className="bg-gradient-to-r from-[hsl(var(--cwg-orange))] to-[hsl(var(--cwg-orange))/80] text-white px-3 sm:px-4 py-2 rounded-lg font-orbitron font-medium text-xs sm:text-sm btn-hover transition-all duration-300 w-full"
        onClick={(e) => {
          e.preventDefault();
          connectWallet('metamask');
        }}
        disabled={isConnecting}
      >
        {isConnecting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Wallet className={`h-4 w-4 ${isMobile ? "" : "mr-2"}`} />}
        {!isMobile && (isConnecting ? 'Connecting...' : 'Connect Wallet')}
        {isMobile && (isConnecting ? '...' : '')}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-blue))] border border-[hsl(var(--cwg-blue))] px-2 sm:px-4 py-2 rounded-lg font-orbitron text-xs btn-hover transition-all duration-300 w-full"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <Wallet className={`h-4 w-4 ${isMobile ? "" : "mr-2"}`} />
              {isMobile ? '' : formatEthereumAddress(address || '')}
            </div>
            <ChevronDown className="h-4 w-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Wallet Connected</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="flex justify-between">
            <span className="text-[hsl(var(--cwg-muted))]">Address:</span>
            <span className="font-mono text-xs">{formatEthereumAddress(address || '')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex justify-between">
            <span className="text-[hsl(var(--cwg-muted))]">Balance:</span>
            <span>{balance}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex justify-between">
            <span className="text-[hsl(var(--cwg-muted))]">Network:</span>
            <div className="flex items-center">
              {networkStatus === 'supported' ? (
                <span className="flex items-center text-green-500">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  {chainId ? (
                    chainId === 1 ? 'Ethereum Mainnet' :
                    chainId === 5 ? 'Goerli Testnet' :
                    chainId === 137 ? 'Polygon Mainnet' :
                    chainId === 80001 ? 'Mumbai Testnet' :
                    `Network #${chainId}`
                  ) : 'Unknown'}
                </span>
              ) : networkStatus === 'unsupported' ? (
                <span className="flex items-center text-red-500">
                  <XCircle className="mr-1 h-3 w-3" />
                  Unsupported
                </span>
              ) : (
                <span className="text-[hsl(var(--cwg-muted))]">Unknown</span>
              )}
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-red-500 cursor-pointer flex justify-center"
          onClick={() => disconnectWallet()}
        >
          Disconnect Wallet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}