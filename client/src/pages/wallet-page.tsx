import { useState, useEffect } from 'react';
import { useWeb3 } from '@/lib/web3/Web3Provider';
import { WalletConnect } from '@/components/web3/WalletConnect';
import { WalletInfo } from '@/components/web3/WalletInfo';
import { NFTCard } from '@/components/web3/NFTCard';
import { Page } from '@/components/ui/page';
import { PageHeader } from '@/components/ui/page-header';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { fetchWalletNFTs, mapNFTMetadataToCardProps } from '@/lib/web3/nft-service';
import { NFTCardProps } from '@/components/web3/NFTCard';
import { useQuery } from '@tanstack/react-query';
import { 
  Wallet, 
  Search, 
  PlusSquare, 
  ImagePlus, 
  RefreshCcw, 
  Filter, 
  ArrowUpDown,
  Check,
  SlidersHorizontal,
  X
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// NFT detail dialog
function NFTDetailDialog({ nft, isOpen, onClose }: { 
  nft: NFTCardProps | null; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  if (!nft) return null;

  // Function to get rarity color
  const getRarityColor = () => {
    switch(nft.rarity.toLowerCase()) {
      case 'common': return 'bg-zinc-400 text-zinc-900';
      case 'uncommon': return 'bg-green-400 text-green-900';
      case 'rare': return 'bg-blue-400 text-blue-900';
      case 'epic': return 'bg-purple-400 text-purple-900';
      case 'legendary': return 'bg-amber-400 text-amber-900';
      default: return 'bg-zinc-400 text-zinc-900';
    }
  };

  // Get chain specific style
  const getChainStyle = () => {
    switch(nft.chain.toLowerCase()) {
      case 'ethereum': return 'text-blue-500';
      case 'polygon': return 'text-purple-500';
      case 'arbitrum': return 'text-blue-400';
      default: return 'text-zinc-500';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-blue))]">
        <DialogHeader>
          <DialogTitle className="neon-text-blue text-2xl font-orbitron">{nft.name}</DialogTitle>
          <DialogDescription>
            Collection: <span className="font-semibold">{nft.collection}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="aspect-square overflow-hidden rounded-lg border border-[hsl(var(--cwg-blue))/20] bg-[hsl(var(--cwg-dark))]">
            <img 
              src={nft.imageUrl} 
              alt={nft.name} 
              className="w-full h-full object-cover" 
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/400x400?text=NFT+Image';
              }}
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Description</h3>
              <p className="mt-1">{nft.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <h3 className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Rarity</h3>
                <Badge variant="outline" className={`mt-1 ${getRarityColor()}`}>
                  {nft.rarity.charAt(0).toUpperCase() + nft.rarity.slice(1)}
                </Badge>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Chain</h3>
                <p className={`mt-1 font-medium ${getChainStyle()}`}>{nft.chain}</p>
              </div>
              
              {nft.type && (
                <div>
                  <h3 className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Type</h3>
                  <p className="mt-1">{nft.type}</p>
                </div>
              )}
              
              {nft.game && (
                <div>
                  <h3 className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Game</h3>
                  <p className="mt-1">{nft.game}</p>
                </div>
              )}
              
              {nft.level !== undefined && (
                <div>
                  <h3 className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Level</h3>
                  <p className="mt-1">{nft.level}</p>
                </div>
              )}
              
              {nft.power !== undefined && (
                <div>
                  <h3 className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Power</h3>
                  <p className="mt-1">{nft.power}</p>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Contract Details</h3>
              <p className="mt-1 font-mono text-xs break-all">{nft.contractAddress}</p>
              <p className="mt-1 font-mono text-xs">Token ID: {nft.tokenId}</p>
            </div>
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="outline">Rent Out</Button>
          <Button variant="outline">List for Sale</Button>
          <Button variant="outline">Share</Button>
          <Button 
            className="ml-auto" 
            onClick={() => {
              window.open(`https://etherscan.io/token/${nft.contractAddress}?a=${nft.tokenId}`, '_blank');
            }}
          >
            View on Etherscan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function WalletPage() {
  const { isConnected, address } = useWeb3();
  const [selectedTab, setSelectedTab] = useState('nfts');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [sortOption, setSortOption] = useState('name-asc');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [selectedNFT, setSelectedNFT] = useState<NFTCardProps | null>(null);
  const [isNFTDetailOpen, setIsNFTDetailOpen] = useState(false);
  const { toast } = useToast();
  
  // NFT fetching
  const { 
    data: nftData, 
    isLoading: isLoadingNFTs,
    isError: isNFTError,
    error: nftError,
    refetch: refetchNFTs
  } = useQuery({
    queryKey: ['/api/nfts/wallet', address],
    queryFn: async () => {
      if (!address) return { nfts: [], totalCount: 0 };
      return await fetchWalletNFTs(address);
    },
    enabled: !!isConnected && !!address,
  });
  
  // NFT processing
  const [processedNFTs, setProcessedNFTs] = useState<NFTCardProps[]>([]);
  
  useEffect(() => {
    if (nftData?.nfts) {
      // Map API data to card props
      const mappedNFTs = nftData.nfts.map((nft: any) => mapNFTMetadataToCardProps(nft));
      setProcessedNFTs(mappedNFTs);
    } else {
      setProcessedNFTs([]);
    }
  }, [nftData]);
  
  // Collections extracted from NFTs
  const collections = processedNFTs.length > 0 
    ? ['all', ...Array.from(new Set(processedNFTs.map(nft => nft.collection)))]
    : ['all'];
  
  // Handle NFT click
  const handleNFTClick = (nft: NFTCardProps) => {
    setSelectedNFT(nft);
    setIsNFTDetailOpen(true);
  };
  
  // Close NFT detail dialog
  const closeNFTDetail = () => {
    setIsNFTDetailOpen(false);
    setSelectedNFT(null);
  };
  
  // Filter and sort NFTs
  const filteredAndSortedNFTs = processedNFTs
    // Filter by search query
    .filter(nft => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        nft.name.toLowerCase().includes(query) ||
        nft.description.toLowerCase().includes(query) ||
        nft.collection.toLowerCase().includes(query) ||
        (nft.game && nft.game.toLowerCase().includes(query))
      );
    })
    // Filter by collection
    .filter(nft => {
      if (selectedCollection === 'all') return true;
      return nft.collection === selectedCollection;
    })
    // Filter by rarity
    .filter(nft => {
      if (rarityFilter === 'all') return true;
      return nft.rarity.toLowerCase() === rarityFilter.toLowerCase();
    })
    // Sort
    .sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'rarity-asc': {
          const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
          return (rarityOrder[a.rarity.toLowerCase() as keyof typeof rarityOrder] || 0) - 
                (rarityOrder[b.rarity.toLowerCase() as keyof typeof rarityOrder] || 0);
        }
        case 'rarity-desc': {
          const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
          return (rarityOrder[b.rarity.toLowerCase() as keyof typeof rarityOrder] || 0) - 
                (rarityOrder[a.rarity.toLowerCase() as keyof typeof rarityOrder] || 0);
        }
        default:
          return 0;
      }
    });
  
  // Refresh NFTs
  const handleRefreshNFTs = () => {
    refetchNFTs();
    toast({
      title: "Refreshing NFTs",
      description: "Fetching the latest NFT data from the blockchain...",
    });
  };

  // Initial connection message
  useEffect(() => {
    if (!isConnected) {
      toast({
        title: "Connect Your Wallet",
        description: "Connect your Web3 wallet to view your NFTs and tokens.",
      });
    }
  }, [isConnected, toast]);
  
  return (
    <Page>
      <PageHeader
        title="Web3 Wallet"
        description="Connect your wallet to view and manage your NFTs and tokens"
        icon={<Wallet className="h-6 w-6" />}
      />
      
      {/* Wallet Connection & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1">
          {isConnected ? (
            <WalletInfo className="h-full" />
          ) : (
            <div className="bg-[hsl(var(--cwg-dark-blue))] border border-[hsl(var(--cwg-blue))] p-6 rounded-lg flex flex-col items-center justify-center gap-6 h-full min-h-[200px]">
              <h2 className="neon-text-blue text-2xl font-orbitron text-center">Connect Your Wallet</h2>
              <p className="text-center mb-4 text-[hsl(var(--cwg-muted))]">
                Connect your Web3 wallet to view your NFTs and tokens
              </p>
              <div className="w-full max-w-xs">
                <WalletConnect />
              </div>
            </div>
          )}
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-[hsl(var(--cwg-dark-blue))] border border-[hsl(var(--cwg-blue))] rounded-lg p-6">
            <Tabs defaultValue="nfts" className="w-full" onValueChange={setSelectedTab}>
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="nfts">NFTs</TabsTrigger>
                <TabsTrigger value="tokens">Tokens</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="nfts" className="space-y-6">
                {isConnected ? (
                  <>
                    {/* NFT Controls */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--cwg-muted))]" />
                        <Input
                          placeholder="Search NFTs..."
                          className="pl-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Filter className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>Filter NFTs</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                              <DropdownMenuLabel className="text-xs text-[hsl(var(--cwg-muted))]">Collection</DropdownMenuLabel>
                              {collections.map((collection) => (
                                <DropdownMenuItem 
                                  key={collection}
                                  onClick={() => setSelectedCollection(collection)}
                                  className="flex justify-between"
                                >
                                  {collection === 'all' ? 'All Collections' : collection}
                                  {selectedCollection === collection && <Check className="h-4 w-4" />}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel className="text-xs text-[hsl(var(--cwg-muted))]">Rarity</DropdownMenuLabel>
                              {['all', 'common', 'uncommon', 'rare', 'epic', 'legendary'].map((rarity) => (
                                <DropdownMenuItem 
                                  key={rarity}
                                  onClick={() => setRarityFilter(rarity)}
                                  className="flex justify-between"
                                >
                                  {rarity === 'all' ? 'All Rarities' : rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                                  {rarityFilter === rarity && <Check className="h-4 w-4" />}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                              <ArrowUpDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>Sort NFTs</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => setSortOption('name-asc')}
                              className="flex justify-between"
                            >
                              Name (A-Z)
                              {sortOption === 'name-asc' && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setSortOption('name-desc')}
                              className="flex justify-between"
                            >
                              Name (Z-A)
                              {sortOption === 'name-desc' && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setSortOption('rarity-asc')}
                              className="flex justify-between"
                            >
                              Rarity (Low to High)
                              {sortOption === 'rarity-asc' && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setSortOption('rarity-desc')}
                              className="flex justify-between"
                            >
                              Rarity (High to Low)
                              {sortOption === 'rarity-desc' && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        
                        <Button variant="outline" size="icon" onClick={handleRefreshNFTs} disabled={isLoadingNFTs}>
                          <RefreshCcw className={`h-4 w-4 ${isLoadingNFTs ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Active Filters */}
                    {(selectedCollection !== 'all' || rarityFilter !== 'all' || searchQuery) && (
                      <div className="flex flex-wrap gap-2">
                        {selectedCollection !== 'all' && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            Collection: {selectedCollection}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-4 w-4 p-0 ml-1" 
                              onClick={() => setSelectedCollection('all')}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        )}
                        
                        {rarityFilter !== 'all' && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            Rarity: {rarityFilter.charAt(0).toUpperCase() + rarityFilter.slice(1)}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-4 w-4 p-0 ml-1" 
                              onClick={() => setRarityFilter('all')}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        )}
                        
                        {searchQuery && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            Search: {searchQuery}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-4 w-4 p-0 ml-1" 
                              onClick={() => setSearchQuery('')}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2 text-xs" 
                          onClick={() => {
                            setSelectedCollection('all');
                            setRarityFilter('all');
                            setSearchQuery('');
                          }}
                        >
                          Clear All
                        </Button>
                      </div>
                    )}
                    
                    {/* NFT Grid */}
                    {isLoadingNFTs ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="aspect-square">
                            <Skeleton className="h-full w-full rounded-lg" />
                          </div>
                        ))}
                      </div>
                    ) : isNFTError ? (
                      <div className="p-8 text-center">
                        <p className="text-red-500 mb-4">Error loading NFTs: {(nftError as Error)?.message || 'Unknown error'}</p>
                        <Button onClick={() => refetchNFTs()}>Try Again</Button>
                      </div>
                    ) : filteredAndSortedNFTs.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {filteredAndSortedNFTs.map((nft) => (
                          <NFTCard 
                            key={nft.id} 
                            {...nft} 
                            onClick={() => handleNFTClick(nft)}
                          />
                        ))}
                      </div>
                    ) : processedNFTs.length > 0 ? (
                      <div className="p-8 text-center">
                        <p className="text-[hsl(var(--cwg-muted))] mb-4">No NFTs match your filters</p>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSelectedCollection('all');
                            setRarityFilter('all');
                            setSearchQuery('');
                          }}
                        >
                          Clear Filters
                        </Button>
                      </div>
                    ) : (
                      <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="bg-[hsl(var(--cwg-dark))] p-4 rounded-full">
                          <ImagePlus className="h-8 w-8 text-[hsl(var(--cwg-muted))]" />
                        </div>
                        <h3 className="text-xl font-medium">No NFTs Found</h3>
                        <p className="text-[hsl(var(--cwg-muted))] max-w-md">
                          You don't have any NFTs in your wallet. Purchase or mint some NFTs to see them here.
                        </p>
                        <div className="flex gap-3 mt-4">
                          <Button variant="outline">
                            Browse Marketplace
                          </Button>
                          <Button>
                            Mint an NFT
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 h-[400px]">
                    <div className="bg-[hsl(var(--cwg-dark))] p-4 rounded-full">
                      <Wallet className="h-8 w-8 text-[hsl(var(--cwg-muted))]" />
                    </div>
                    <h3 className="text-xl font-medium">No Wallet Connected</h3>
                    <p className="text-[hsl(var(--cwg-muted))] max-w-md">
                      Connect your Web3 wallet to view your NFTs and tokens
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="tokens">
                <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 h-[400px]">
                  <div className="bg-[hsl(var(--cwg-dark))] p-4 rounded-full">
                    <SlidersHorizontal className="h-8 w-8 text-[hsl(var(--cwg-muted))]" />
                  </div>
                  <h3 className="text-xl font-medium">Tokens Coming Soon</h3>
                  <p className="text-[hsl(var(--cwg-muted))] max-w-md">
                    We're working on integrating ERC-20 token support. Stay tuned!
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="transactions">
                <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 h-[400px]">
                  <div className="bg-[hsl(var(--cwg-dark))] p-4 rounded-full">
                    <SlidersHorizontal className="h-8 w-8 text-[hsl(var(--cwg-muted))]" />
                  </div>
                  <h3 className="text-xl font-medium">Transactions Coming Soon</h3>
                  <p className="text-[hsl(var(--cwg-muted))] max-w-md">
                    Transaction history will be available in the next update!
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* NFT Detail Dialog */}
      <NFTDetailDialog 
        nft={selectedNFT} 
        isOpen={isNFTDetailOpen} 
        onClose={closeNFTDetail} 
      />
    </Page>
  );
}