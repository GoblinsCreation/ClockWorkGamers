import { formatUnits, parseUnits } from '@ethersproject/units';

/**
 * Formats Wei value to readable ETH with specified decimal places
 */
export function formatWeiToEth(wei: string | number, decimals: number = 4): string {
  try {
    const formatted = formatUnits(wei.toString(), 'ether');
    const parts = formatted.split('.');
    
    if (parts.length > 1) {
      return `${parts[0]}.${parts[1].substring(0, decimals)}`;
    }
    
    return formatted;
  } catch (error) {
    console.error('Error formatting Wei to ETH:', error);
    return '0';
  }
}

/**
 * Check if wallet is connected
 */
export function isWalletConnected(account: string | null | undefined): boolean {
  return !!account && account !== '' && account !== '0x0000000000000000000000000000000000000000';
}

/**
 * Check if a network is supported (for this app we'll use mainnet and some testnets)
 */
export function isSupportedNetwork(chainId: number | null | undefined): boolean {
  // Supported networks: Ethereum Mainnet (1), Goerli (5), Mumbai (80001), Polygon (137)
  const supportedNetworks = [1, 5, 80001, 137];
  return !!chainId && supportedNetworks.includes(chainId);
}

/**
 * Get network name from chainId
 */
export function getNetworkName(chainId: number | null | undefined): string {
  if (!chainId) return 'Unknown Network';
  
  const networks: Record<number, string> = {
    1: 'Ethereum Mainnet',
    5: 'Goerli Testnet',
    137: 'Polygon Mainnet',
    80001: 'Mumbai Testnet'
  };
  
  return networks[chainId] || `Unknown Network (${chainId})`;
}

/**
 * Convert token amount to human-readable format with symbol
 */
export function formatTokenAmount(amount: string | number, symbol: string = 'ETH', decimals: number = 4): string {
  try {
    const formatted = typeof amount === 'string' ? 
      parseFloat(amount).toFixed(decimals) : 
      amount.toFixed(decimals);
    
    // Remove trailing zeros
    const trimmed = formatted.replace(/\.?0+$/, '');
    
    return `${trimmed} ${symbol}`;
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return `0 ${symbol}`;
  }
}