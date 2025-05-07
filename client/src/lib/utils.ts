import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format an Ethereum address to display format (0x1234...5678)
 */
export function formatEthereumAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (!address) return '';
  if (address.length < startChars + endChars) return address;
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Format a crypto amount with appropriate precision
 */
export function formatCryptoAmount(amount: string | number, precision: number = 4): string {
  return typeof amount === 'number' 
    ? amount.toFixed(precision) 
    : parseFloat(amount).toFixed(precision);
}
