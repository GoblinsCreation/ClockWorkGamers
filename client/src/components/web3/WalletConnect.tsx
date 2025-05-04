import { useState, useEffect } from 'react';
import { useWeb3 } from '@/hooks/use-web3';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
import { getNetworkName, isSupportedNetwork } from '@/lib/web3-utils';

export function WalletConnect() {
  const { connected, connecting, account, chainId, balance, connectWallet, disconnectWallet } = useWeb3();
  const [networkStatus, setNetworkStatus] = useState<'supported' | 'unsupported' | 'unknown'>('unknown');
  
  console.log("Rendering WalletConnect component");

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

  if (!connected) {
    return (
      <Button 
        variant="outline" 
        className="bg-gradient-to-r from-[hsl(var(--cwg-orange))] to-[hsl(var(--cwg-orange))/80] text-white px-4 py-2 rounded-lg font-orbitron font-medium text-sm btn-hover transition-all duration-300 w-full"
        onClick={connectWallet}
        disabled={connecting}
      >
        {connecting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Wallet className="mr-2 h-4 w-4" />}
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-blue))] border border-[hsl(var(--cwg-blue))] px-4 py-2 rounded-lg font-orbitron text-xs btn-hover transition-all duration-300 w-full"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <Wallet className="mr-2 h-4 w-4" />
              {formatEthereumAddress(account || '')}
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
            <span className="font-mono text-xs">{formatEthereumAddress(account || '')}</span>
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
                  {getNetworkName(chainId)}
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
          onClick={disconnectWallet}
        >
          Disconnect Wallet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}