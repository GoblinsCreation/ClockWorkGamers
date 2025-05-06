import { Request, Response } from 'express';
import fetch from 'node-fetch';

type NFTMetadata = {
  contract: {
    address: string;
  };
  id: {
    tokenId: string;
    tokenMetadata?: {
      tokenType?: string;
    };
  };
  title: string;
  description: string;
  tokenUri?: {
    gateway: string;
    raw: string;
  };
  media?: {
    gateway: string;
    thumbnail?: string;
    raw?: string;
    format?: string;
  }[];
  metadata?: {
    name?: string;
    description?: string;
    image?: string;
    attributes?: Array<{
      trait_type: string;
      value: string | number;
    }>;
  };
  contractMetadata?: {
    name?: string;
    symbol?: string;
    tokenType?: string;
  };
};

/**
 * Get all NFTs for a given wallet address
 */
export async function getWalletNFTs(req: Request, res: Response) {
  try {
    const { address } = req.query;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    if (!address) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    // Example of how we could implement this with a real API (e.g., Alchemy or Moralis)
    // For now, we'll generate sample NFT data for demo purposes
    const demoNFTs = generateDemoNFTs(address as string, limit, offset);
    
    return res.status(200).json({
      nfts: demoNFTs,
      pageKey: null,
      totalCount: demoNFTs.length
    });
  } catch (error) {
    console.error('Error fetching wallet NFTs:', error);
    return res.status(500).json({ error: 'Failed to fetch wallet NFTs' });
  }
}

/**
 * Handler for getting NFT details
 */
export async function getNFTDetails(req: Request, res: Response) {
  try {
    const { contractAddress, tokenId } = req.params;
    
    if (!contractAddress || !tokenId) {
      return res.status(400).json({ error: 'Contract address and token ID are required' });
    }

    // Example of implementing with a real API
    // For now, return a sample NFT for demo
    const nft = generateDemoNFT(contractAddress, tokenId);
    
    return res.status(200).json(nft);
  } catch (error) {
    console.error('Error fetching NFT details:', error);
    return res.status(500).json({ error: 'Failed to fetch NFT details' });
  }
}

/**
 * Handler for getting NFT collection details
 */
export async function getNFTCollection(req: Request, res: Response) {
  try {
    const { contractAddress } = req.params;
    
    if (!contractAddress) {
      return res.status(400).json({ error: 'Contract address is required' });
    }

    // Demo collection data
    const collection = {
      contractAddress,
      name: `${contractAddress.substring(0, 6)}...${contractAddress.slice(-4)} Collection`,
      symbol: 'CWG',
      totalSupply: Math.floor(Math.random() * 10000) + 1000,
      floorPrice: (Math.random() * 5).toFixed(3),
      owners: Math.floor(Math.random() * 5000) + 500,
      items: Math.floor(Math.random() * 10000) + 1000,
      description: 'A collection of unique digital items created for the ClockWork Gamers community.',
      socialLinks: {
        website: 'https://clockworkgamers.net',
        discord: 'https://discord.gg/clockworkgamers',
        twitter: 'https://twitter.com/clockworkgamers'
      },
      verified: Math.random() > 0.5,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365)).toISOString()
    };
    
    return res.status(200).json(collection);
  } catch (error) {
    console.error('Error fetching NFT collection:', error);
    return res.status(500).json({ error: 'Failed to fetch NFT collection details' });
  }
}

// Helper function to generate demo NFTs for testing
function generateDemoNFTs(walletAddress: string, limit: number = 20, offset: number = 0): NFTMetadata[] {
  const collections = [
    { name: 'ClockWork Guardians', symbol: 'CWG', address: '0x7DaEC605E9e2a1717326eeDFd660601e2753A057' },
    { name: 'Cyber Knights', symbol: 'CKNT', address: '0x8a90CAb2b38dba80c64b7734e58Ee1dB38B8992e' },
    { name: 'Meta Warriors', symbol: 'MWAR', address: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D' },
    { name: 'Digital Legends', symbol: 'DLEG', address: '0x60E4d786628Fea6478F785A6d7e704777c86a7c6' },
    { name: 'Crypto Champions', symbol: 'CHMP', address: '0x1A92f7381B9F03921564a437210bB9396471050C' },
  ];
  
  const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const types = ['character', 'weapon', 'item', 'skin', 'mount', 'background'];
  const games = ['Axie Infinity', 'The Sandbox', 'Decentraland', 'Gods Unchained', 'Illuvium'];
  
  const nfts: NFTMetadata[] = [];
  
  for (let i = 0; i < limit; i++) {
    const collectionIndex = Math.floor(Math.random() * collections.length);
    const collection = collections[collectionIndex];
    const tokenId = Math.floor(Math.random() * 10000).toString();
    const rarityIndex = Math.floor(Math.random() * rarities.length);
    const typeIndex = Math.floor(Math.random() * types.length);
    const gameIndex = Math.floor(Math.random() * games.length);
    
    const nft: NFTMetadata = {
      contract: {
        address: collection.address,
      },
      id: {
        tokenId,
        tokenMetadata: {
          tokenType: 'ERC721',
        },
      },
      title: `${collection.name} #${tokenId}`,
      description: `A unique ${rarities[rarityIndex]} ${types[typeIndex]} from the ${collection.name} collection, compatible with ${games[gameIndex]}.`,
      tokenUri: {
        gateway: `https://example.com/nft/${collection.address}/${tokenId}`,
        raw: `https://example.com/nft/${collection.address}/${tokenId}/metadata`,
      },
      media: [
        {
          gateway: `https://picsum.photos/seed/${collection.address}${tokenId}/400/400`,
          thumbnail: `https://picsum.photos/seed/${collection.address}${tokenId}/200/200`,
          format: 'image/jpeg',
        },
      ],
      metadata: {
        name: `${collection.name} #${tokenId}`,
        description: `A unique ${rarities[rarityIndex]} ${types[typeIndex]} from the ${collection.name} collection, compatible with ${games[gameIndex]}.`,
        image: `https://picsum.photos/seed/${collection.address}${tokenId}/400/400`,
        attributes: [
          {
            trait_type: 'Type',
            value: types[typeIndex],
          },
          {
            trait_type: 'Rarity',
            value: rarities[rarityIndex],
          },
          {
            trait_type: 'Game',
            value: games[gameIndex],
          },
          {
            trait_type: 'Level',
            value: Math.floor(Math.random() * 100),
          },
          {
            trait_type: 'Power',
            value: Math.floor(Math.random() * 1000),
          },
        ],
      },
      contractMetadata: {
        name: collection.name,
        symbol: collection.symbol,
        tokenType: 'ERC721',
      },
    };
    
    nfts.push(nft);
  }
  
  return nfts;
}

// Helper function to generate a single demo NFT
function generateDemoNFT(contractAddress: string, tokenId: string): NFTMetadata {
  const collections = [
    { name: 'ClockWork Guardians', symbol: 'CWG' },
    { name: 'Cyber Knights', symbol: 'CKNT' },
    { name: 'Meta Warriors', symbol: 'MWAR' },
    { name: 'Digital Legends', symbol: 'DLEG' },
    { name: 'Crypto Champions', symbol: 'CHMP' },
  ];
  
  const collection = collections[Math.floor(Math.random() * collections.length)];
  const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const types = ['character', 'weapon', 'item', 'skin', 'mount', 'background'];
  const games = ['Axie Infinity', 'The Sandbox', 'Decentraland', 'Gods Unchained', 'Illuvium'];
  
  const rarityIndex = Math.floor(Math.random() * rarities.length);
  const typeIndex = Math.floor(Math.random() * types.length);
  const gameIndex = Math.floor(Math.random() * games.length);
  
  return {
    contract: {
      address: contractAddress,
    },
    id: {
      tokenId,
      tokenMetadata: {
        tokenType: 'ERC721',
      },
    },
    title: `${collection.name} #${tokenId}`,
    description: `A unique ${rarities[rarityIndex]} ${types[typeIndex]} from the ${collection.name} collection, compatible with ${games[gameIndex]}.`,
    tokenUri: {
      gateway: `https://example.com/nft/${contractAddress}/${tokenId}`,
      raw: `https://example.com/nft/${contractAddress}/${tokenId}/metadata`,
    },
    media: [
      {
        gateway: `https://picsum.photos/seed/${contractAddress}${tokenId}/400/400`,
        thumbnail: `https://picsum.photos/seed/${contractAddress}${tokenId}/200/200`,
        format: 'image/jpeg',
      },
    ],
    metadata: {
      name: `${collection.name} #${tokenId}`,
      description: `A unique ${rarities[rarityIndex]} ${types[typeIndex]} from the ${collection.name} collection, compatible with ${games[gameIndex]}.`,
      image: `https://picsum.photos/seed/${contractAddress}${tokenId}/400/400`,
      attributes: [
        {
          trait_type: 'Type',
          value: types[typeIndex],
        },
        {
          trait_type: 'Rarity',
          value: rarities[rarityIndex],
        },
        {
          trait_type: 'Game',
          value: games[gameIndex],
        },
        {
          trait_type: 'Level',
          value: Math.floor(Math.random() * 100),
        },
        {
          trait_type: 'Power',
          value: Math.floor(Math.random() * 1000),
        },
      ],
    },
    contractMetadata: {
      name: collection.name,
      symbol: collection.symbol,
      tokenType: 'ERC721',
    },
  };
}