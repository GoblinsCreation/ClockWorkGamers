import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';

// ABI (Application Binary Interface) for ERC-721 NFT standard
// This is a simplified version with only the methods we need
const ERC721_ABI = [
  // Read-only functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function getApproved(uint256 tokenId) view returns (address)",
  
  // Write functions
  "function approve(address to, uint256 tokenId)",
  "function setApprovalForAll(address operator, bool approved)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)"
];

// Marketplace ABI - this would be the ABI of your marketplace contract
const MARKETPLACE_ABI = [
  // Read functions
  "function getListedNFTs() view returns (tuple(address contractAddress, uint256 tokenId, address seller, uint256 price, bool isActive)[])",
  "function isTokenListed(address contractAddress, uint256 tokenId) view returns (bool)",
  "function getListing(address contractAddress, uint256 tokenId) view returns (tuple(address seller, uint256 price, bool isActive))",
  
  // Write functions
  "function listNFT(address contractAddress, uint256 tokenId, uint256 price)",
  "function updateListing(address contractAddress, uint256 tokenId, uint256 newPrice)",
  "function cancelListing(address contractAddress, uint256 tokenId)",
  "function buyNFT(address contractAddress, uint256 tokenId)",
  
  // Events
  "event NFTListed(address indexed contractAddress, uint256 indexed tokenId, address indexed seller, uint256 price)",
  "event NFTSold(address indexed contractAddress, uint256 indexed tokenId, address seller, address buyer, uint256 price)",
  "event ListingCancelled(address indexed contractAddress, uint256 indexed tokenId, address indexed seller)"
];

// Class to interact with an NFT contract
export class NFTContract {
  private contract: Contract;
  private provider: Web3Provider;
  
  constructor(contractAddress: string, provider: Web3Provider) {
    this.provider = provider;
    this.contract = new Contract(contractAddress, ERC721_ABI, provider);
  }
  
  // Get the name of the NFT collection
  async getName(): Promise<string> {
    return await this.contract.name();
  }
  
  // Get the symbol of the NFT collection
  async getSymbol(): Promise<string> {
    return await this.contract.symbol();
  }
  
  // Get the balance of NFTs owned by an address
  async getBalance(ownerAddress: string): Promise<number> {
    const balance = await this.contract.balanceOf(ownerAddress);
    return Number(balance.toString());
  }
  
  // Get the owner of a specific NFT
  async getOwner(tokenId: number): Promise<string> {
    return await this.contract.ownerOf(tokenId);
  }
  
  // Get the metadata URI of an NFT
  async getTokenURI(tokenId: number): Promise<string> {
    return await this.contract.tokenURI(tokenId);
  }
  
  // Check if an operator is approved to manage all NFTs of an owner
  async isApprovedForAll(ownerAddress: string, operatorAddress: string): Promise<boolean> {
    return await this.contract.isApprovedForAll(ownerAddress, operatorAddress);
  }
  
  // Transfer an NFT from one address to another
  async transferNFT(fromAddress: string, toAddress: string, tokenId: number): Promise<any> {
    const signer = this.provider.getSigner(fromAddress);
    const connectedContract = this.contract.connect(signer);
    
    try {
      const tx = await connectedContract.transferFrom(fromAddress, toAddress, tokenId);
      return await tx.wait();
    } catch (error) {
      console.error("Error transferring NFT:", error);
      throw error;
    }
  }
  
  // Approve an address to manage a specific NFT
  async approveNFT(approvedAddress: string, tokenId: number): Promise<any> {
    const signer = this.provider.getSigner();
    const connectedContract = this.contract.connect(signer);
    
    try {
      const tx = await connectedContract.approve(approvedAddress, tokenId);
      return await tx.wait();
    } catch (error) {
      console.error("Error approving NFT:", error);
      throw error;
    }
  }
  
  // Get NFT metadata from tokenURI
  async getNFTMetadata(tokenId: number): Promise<any> {
    try {
      const tokenURI = await this.getTokenURI(tokenId);
      
      // If URI is IPFS, convert to HTTP gateway
      const formattedURI = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
      
      const response = await fetch(formattedURI);
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error fetching NFT metadata:", error);
      return null;
    }
  }
}

// Class to interact with an NFT marketplace contract
export class NFTMarketplace {
  private contract: Contract;
  private provider: Web3Provider;
  
  constructor(marketplaceAddress: string, provider: Web3Provider) {
    this.provider = provider;
    this.contract = new Contract(marketplaceAddress, MARKETPLACE_ABI, provider);
  }
  
  // Get all NFTs listed in the marketplace
  async getListedNFTs(): Promise<any[]> {
    return await this.contract.getListedNFTs();
  }
  
  // Check if a specific NFT is listed in the marketplace
  async isNFTListed(contractAddress: string, tokenId: number): Promise<boolean> {
    return await this.contract.isTokenListed(contractAddress, tokenId);
  }
  
  // Get listing details for a specific NFT
  async getListing(contractAddress: string, tokenId: number): Promise<any> {
    return await this.contract.getListing(contractAddress, tokenId);
  }
  
  // List an NFT for sale
  async listNFT(contractAddress: string, tokenId: number, price: string): Promise<any> {
    const signer = this.provider.getSigner();
    const connectedContract = this.contract.connect(signer);
    
    try {
      const tx = await connectedContract.listNFT(contractAddress, tokenId, price);
      return await tx.wait();
    } catch (error) {
      console.error("Error listing NFT:", error);
      throw error;
    }
  }
  
  // Update the price of a listed NFT
  async updateListing(contractAddress: string, tokenId: number, newPrice: string): Promise<any> {
    const signer = this.provider.getSigner();
    const connectedContract = this.contract.connect(signer);
    
    try {
      const tx = await connectedContract.updateListing(contractAddress, tokenId, newPrice);
      return await tx.wait();
    } catch (error) {
      console.error("Error updating NFT listing:", error);
      throw error;
    }
  }
  
  // Cancel an NFT listing
  async cancelListing(contractAddress: string, tokenId: number): Promise<any> {
    const signer = this.provider.getSigner();
    const connectedContract = this.contract.connect(signer);
    
    try {
      const tx = await connectedContract.cancelListing(contractAddress, tokenId);
      return await tx.wait();
    } catch (error) {
      console.error("Error cancelling NFT listing:", error);
      throw error;
    }
  }
  
  // Buy a listed NFT
  async buyNFT(contractAddress: string, tokenId: number, price: string): Promise<any> {
    const signer = this.provider.getSigner();
    const connectedContract = this.contract.connect(signer);
    
    try {
      const tx = await connectedContract.buyNFT(contractAddress, tokenId, {
        value: price
      });
      return await tx.wait();
    } catch (error) {
      console.error("Error buying NFT:", error);
      throw error;
    }
  }
}