import { formatEther } from '@ethersproject/units';

/**
 * Formats Wei value to readable ETH with specified decimal places
 */
export function formatWeiToEth(wei: string | number, decimals: number = 4): string {
  try {
    const eth = formatEther(wei.toString());
    return parseFloat(eth).toFixed(decimals);
  } catch (error) {
    console.error('Error formatting wei to eth:', error);
    return '0.0000';
  }
}

/**
 * Check if wallet is connected
 */
export function isWalletConnected(account: string | null | undefined): boolean {
  return Boolean(account && account.startsWith('0x'));
}

/**
 * Check if a network is supported (for this app we'll use mainnet and some testnets)
 */
export function isSupportedNetwork(chainId: number | null | undefined): boolean {
  if (!chainId) return false;
  // Ethereum Mainnet, Goerli, Sepolia, Mumbai, Polygon
  const supportedNetworks = [1, 5, 11155111, 80001, 137];
  return supportedNetworks.includes(chainId);
}

/**
 * Get network name from chainId
 */
export function getNetworkName(chainId: number | null | undefined): string {
  if (!chainId) return 'Unknown Network';
  
  const networks: Record<number, string> = {
    1: 'Ethereum Mainnet',
    5: 'Goerli Testnet',
    11155111: 'Sepolia Testnet',
    80001: 'Mumbai Testnet',
    137: 'Polygon Mainnet'
  };
  
  return networks[chainId] || 'Unknown Network';
}

/**
 * Convert token amount to human-readable format with symbol
 */
export function formatTokenAmount(amount: string | number, symbol: string = 'ETH', decimals: number = 4): string {
  if (!amount) return `0 ${symbol}`;
  
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${num.toFixed(decimals)} ${symbol}`;
}