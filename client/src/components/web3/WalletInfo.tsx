import { useState, useEffect } from 'react';
import { useWeb3 } from '@/lib/web3/Web3Provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Copy, CheckCircle2, RefreshCw, ExternalLink } from 'lucide-react';
import { formatEthereumAddress } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

export interface WalletInfoProps {
  className?: string;
}

export function WalletInfo({ className }: WalletInfoProps) {
  const { address, balance, chainId, isConnected, isConnecting, network, error } = useWeb3();
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);
  
  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
    }
  };
  
  const openExplorer = () => {
    if (!address) return;
    
    let explorerUrl;
    if (chainId === 1) {
      explorerUrl = `https://etherscan.io/address/${address}`;
    } else if (chainId === 137) {
      explorerUrl = `https://polygonscan.com/address/${address}`;
    } else if (chainId === 42161) {
      explorerUrl = `https://arbiscan.io/address/${address}`;
    } else {
      explorerUrl = `https://etherscan.io/address/${address}`;
    }
    
    window.open(explorerUrl, '_blank');
  };
  
  // Simulated wallet data for the demo
  const walletStats = {
    totalNFTs: Math.floor(Math.random() * 50) + 1,
    totalCollections: Math.floor(Math.random() * 10) + 1,
    rarity: {
      common: Math.floor(Math.random() * 20),
      uncommon: Math.floor(Math.random() * 15),
      rare: Math.floor(Math.random() * 10),
      epic: Math.floor(Math.random() * 5),
      legendary: Math.floor(Math.random() * 3)
    },
    totalGames: Math.floor(Math.random() * 5) + 1,
    lastActivity: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    walletHealth: Math.floor(Math.random() * 100),
  };
  
  // Refresh wallet data
  const refreshWalletData = () => {
    setIsLoading(true);
    // In a real app, this would trigger a refresh of wallet data
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };
  
  if (!isConnected) {
    return (
      <Card className={`${className} bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-blue))]`}>
        <CardHeader>
          <CardTitle className="neon-text-blue">No Wallet Connected</CardTitle>
          <CardDescription>Connect your wallet to view your Web3 assets</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card className={`${className} bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-blue))]`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <Wallet className="mr-2 h-5 w-5 text-[hsl(var(--cwg-blue))]" />
            <CardTitle className="neon-text-blue">My Wallet</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8" 
            onClick={refreshWalletData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-mono bg-[hsl(var(--cwg-dark))] px-2 py-1 rounded-md">
              {formatEthereumAddress(address || '', 8, 6)}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 bg-[hsl(var(--cwg-dark))] hover:bg-[hsl(var(--cwg-dark-blue))]" 
              onClick={copyToClipboard}
            >
              {copied ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-[hsl(var(--cwg-blue))]" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 bg-[hsl(var(--cwg-dark))] hover:bg-[hsl(var(--cwg-dark-blue))]" 
              onClick={openExplorer}
            >
              <ExternalLink className="h-4 w-4 text-[hsl(var(--cwg-blue))]" />
            </Button>
          </div>
          <Badge variant="outline" className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))]">
            {network || (chainId === 1 ? 'Ethereum' : 
                      chainId === 5 ? 'Goerli' : 
                      chainId === 137 ? 'Polygon' : 
                      chainId === 80001 ? 'Mumbai' :
                      chainId === 42161 ? 'Arbitrum' : 
                      chainId ? `Chain #${chainId}` : 'Unknown')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-[hsl(var(--cwg-dark))] rounded-md p-3">
            <p className="text-sm text-[hsl(var(--cwg-muted))]">Balance</p>
            <p className="text-lg font-medium neon-text-orange">{balance || '0.00 ETH'}</p>
          </div>
          <div className="bg-[hsl(var(--cwg-dark))] rounded-md p-3">
            <p className="text-sm text-[hsl(var(--cwg-muted))]">NFTs</p>
            <p className="text-lg font-medium neon-text-orange">{walletStats.totalNFTs}</p>
          </div>
        </div>
        
        <Separator className="mb-4 bg-[hsl(var(--cwg-muted))/20]" />
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-[hsl(var(--cwg-muted))]">Wallet Health</span>
              <span className="text-sm font-medium">{walletStats.walletHealth}%</span>
            </div>
            <Progress value={walletStats.walletHealth} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[hsl(var(--cwg-muted))]">Collections:</span>
              <span>{walletStats.totalCollections}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[hsl(var(--cwg-muted))]">Games:</span>
              <span>{walletStats.totalGames}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[hsl(var(--cwg-muted))]">Last Activity:</span>
              <span>{walletStats.lastActivity}</span>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-[hsl(var(--cwg-muted))] mb-2">Rarity Distribution</p>
            <div className="flex h-2 overflow-hidden bg-[hsl(var(--cwg-dark))] rounded-full">
              {Object.entries(walletStats.rarity).map(([rarity, count], index) => {
                const total = Object.values(walletStats.rarity).reduce((a, b) => a + b, 0);
                const width = count > 0 ? (count / total) * 100 : 0;
                
                if (width === 0) return null;
                
                const colorMap: Record<string, string> = {
                  common: 'bg-zinc-400',
                  uncommon: 'bg-green-400',
                  rare: 'bg-blue-400',
                  epic: 'bg-purple-400',
                  legendary: 'bg-amber-400',
                };
                
                return (
                  <div 
                    key={rarity} 
                    className={`${colorMap[rarity]} h-full`} 
                    style={{ width: `${width}%` }}
                    title={`${rarity}: ${count}`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-1 text-xs text-[hsl(var(--cwg-muted))]">
              <span>Common</span>
              <span>Legendary</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}