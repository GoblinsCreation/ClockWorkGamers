import { useWeb3 } from '@/hooks/use-web3';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { formatEthereumAddress } from '@/lib/utils';

export function WalletConnect() {
  const { connected, connecting, account, balance, connectWallet, disconnectWallet } = useWeb3();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const viewOnEtherscan = () => {
    if (account) {
      window.open(`https://etherscan.io/address/${account}`, '_blank');
    }
  };

  if (connecting) {
    return (
      <Button disabled className="w-full bg-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-dark))]">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Connecting...
      </Button>
    );
  }

  if (connected && account) {
    return (
      <div className="bg-[hsl(var(--cwg-dark-blue))]/30 rounded-lg p-4 border border-[hsl(var(--cwg-blue))]/30">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-[hsl(var(--cwg-blue))]/20 flex items-center justify-center mr-2">
              <Wallet className="h-4 w-4 text-[hsl(var(--cwg-blue))]" />
            </div>
            <span className="font-orbitron text-sm text-[hsl(var(--cwg-text))]">Connected Wallet</span>
          </div>
          <Button 
            variant="ghost" 
            className="h-8 text-xs text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-blue))]"
            onClick={disconnectWallet}
          >
            Disconnect
          </Button>
        </div>
        
        <div className="p-3 bg-[hsl(var(--cwg-dark))] rounded border border-[hsl(var(--cwg-dark-blue))]">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-[hsl(var(--cwg-text))]">{formatEthereumAddress(account)}</span>
            <div className="flex space-x-1">
              <button 
                onClick={copyAddress} 
                className="p-1 hover:bg-[hsl(var(--cwg-dark-blue))] rounded transition-colors"
                title="Copy address"
              >
                {copied ? 
                  <CheckCircle className="h-4 w-4 text-green-500" /> : 
                  <Copy className="h-4 w-4 text-[hsl(var(--cwg-muted))]" />
                }
              </button>
              <button 
                onClick={viewOnEtherscan} 
                className="p-1 hover:bg-[hsl(var(--cwg-dark-blue))] rounded transition-colors"
                title="View on Etherscan"
              >
                <ExternalLink className="h-4 w-4 text-[hsl(var(--cwg-muted))]" />
              </button>
            </div>
          </div>
          
          <div className="mt-2 flex justify-between items-center">
            <span className="text-xs text-[hsl(var(--cwg-muted))]">Balance</span>
            <span className="text-sm font-orbitron text-[hsl(var(--cwg-blue))]">{parseFloat(balance).toFixed(4)} ETH</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button 
      className="w-full bg-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-dark))] hover:bg-[hsl(var(--cwg-blue))]/90"
      onClick={connectWallet}
    >
      <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
    </Button>
  );
}

export default WalletConnect;