import { NFTCardProps } from '@/components/web3/NFTCard';
import { apiRequest } from '@/lib/queryClient';

/**
 * Fetch NFTs for a wallet address
 */
export async function fetchWalletNFTs(address: string, limit: number = 50, offset: number = 0): Promise<any> {
  try {
    const params = new URLSearchParams({
      address,
      limit: limit.toString(),
      offset: offset.toString(),
    });
    
    const response = await apiRequest('GET', `/api/nfts/wallet?${params}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching wallet NFTs:', error);
    throw error;
  }
}

/**
 * Fetch a specific NFT by contract address and token ID
 */
export async function fetchNFTDetails(contractAddress: string, tokenId: string): Promise<any> {
  try {
    const response = await apiRequest('GET', `/api/nfts/${contractAddress}/${tokenId}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching NFT details:', error);
    throw error;
  }
}

/**
 * Fetch NFT collection details
 */
export async function fetchNFTCollection(contractAddress: string): Promise<any> {
  try {
    const response = await apiRequest('GET', `/api/nfts/collection/${contractAddress}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching NFT collection:', error);
    throw error;
  }
}

/**
 * Map NFT metadata from API to NFTCard props
 */
export function mapNFTMetadataToCardProps(nft: any): NFTCardProps {
  // Extract rarity from attributes
  let rarity = 'common';
  let type = '';
  let game = '';
  let level = 0;
  let power = 0;
  
  if (nft.metadata?.attributes) {
    for (const attr of nft.metadata.attributes) {
      if (attr.trait_type === 'Rarity') {
        rarity = attr.value.toString().toLowerCase();
      } else if (attr.trait_type === 'Type') {
        type = attr.value.toString();
      } else if (attr.trait_type === 'Game') {
        game = attr.value.toString();
      } else if (attr.trait_type === 'Level') {
        level = Number(attr.value);
      } else if (attr.trait_type === 'Power') {
        power = Number(attr.value);
      }
    }
  }

  // Get main image URL
  const imageUrl = nft.media?.[0]?.gateway || 
                  nft.metadata?.image || 
                  `https://picsum.photos/seed/${nft.contract.address}${nft.id.tokenId}/400/400`;

  // Map to card props
  return {
    id: `${nft.contract.address}-${nft.id.tokenId}`,
    name: nft.title || nft.metadata?.name || `NFT #${nft.id.tokenId}`,
    description: nft.description || nft.metadata?.description || 'No description available',
    imageUrl,
    contractAddress: nft.contract.address,
    tokenId: nft.id.tokenId,
    collection: nft.contractMetadata?.name || 'Unknown Collection',
    rarity,
    type,
    game,
    level,
    power,
    chain: getChainFromAddress(nft.contract.address),
  };
}

/**
 * Get the blockchain from the address pattern
 * This is a simple heuristic and not 100% accurate
 */
function getChainFromAddress(address: string): string {
  // Simple demonstration - in reality, we would identify chains by network ID
  // or through more sophisticated means
  const lastChar = address.substring(address.length - 1).toLowerCase();
  
  if (parseInt(lastChar, 16) % 3 === 0) {
    return 'ethereum';
  } else if (parseInt(lastChar, 16) % 3 === 1) {
    return 'polygon';
  } else {
    return 'arbitrum';
  }
}