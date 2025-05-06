import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/lib/web3/Web3Provider';
import { WalletInfo } from '@/components/web3/WalletInfo';
import { NFTCard, NFTCardProps } from '@/components/web3/NFTCard';
import { fetchWalletNFTs, mapNFTMetadataToCardProps } from '@/lib/web3/nft-service';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ConnectWalletButton } from '@/components/web3/ConnectWalletButton';

export default function WalletPage() {
  const { address, isConnected } = useWeb3();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Query NFTs from the backend API
  const {
    data: nfts,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['/api/nfts/wallet', address],
    queryFn: async () => {
      if (!address) return { nfts: [], totalCount: 0 };
      const params = new URLSearchParams({
        address: address,
        limit: '50',
        offset: '0',
      });
      const response = await fetch(`/api/nfts/wallet?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch NFTs');
      }
      return response.json();
    },
    enabled: !!address,
  });

  // Filter and search NFTs
  const filteredNFTs = React.useMemo(() => {
    if (!nfts?.nfts?.length) return [];
    
    return nfts.nfts
      .filter((nft: any) => {
        // Apply search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          return (
            nft.name.toLowerCase().includes(searchLower) ||
            (nft.collection?.name?.toLowerCase().includes(searchLower)) ||
            nft.tokenId.includes(searchTerm)
          );
        }
        return true;
      })
      .filter((nft: any) => {
        // Apply rarity filter
        if (filter === 'all') return true;
        return nft.rarity?.toLowerCase() === filter.toLowerCase();
      })
      .map(mapNFTMetadataToCardProps);
  }, [nfts, searchTerm, filter]);
  
  // Calculate paginated results
  const paginatedNFTs = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredNFTs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredNFTs, currentPage]);
  
  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter]);
  
  // Total pages for pagination
  const totalPages = Math.ceil((filteredNFTs?.length || 0) / itemsPerPage);

  // Handle NFT card click
  const handleNFTClick = (nft: NFTCardProps) => {
    // For now just open the NFT in OpenSea
    let baseUrl = 'https://opensea.io/assets';
    
    if (nft.chain === 'polygon') {
      baseUrl = 'https://opensea.io/assets/matic';
    } else if (nft.chain === 'arbitrum') {
      baseUrl = 'https://opensea.io/assets/arbitrum';
    }
    
    window.open(`${baseUrl}/${nft.contractAddress}/${nft.tokenId}`, '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
        Web3 Wallet
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {isConnected ? (
            <WalletInfo />
          ) : (
            <div className="bg-card border rounded-lg p-8 flex flex-col items-center justify-center space-y-4">
              <h2 className="text-xl font-semibold">Connect Your Wallet</h2>
              <p className="text-center text-muted-foreground">
                Connect your Ethereum wallet to view your NFTs and interact with Web3 features.
              </p>
              <ConnectWalletButton />
            </div>
          )}
        </div>
        
        <div className="lg:col-span-2">
          <Tabs defaultValue="nfts" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="nfts">NFT Collection</TabsTrigger>
              <TabsTrigger value="tokens">Tokens</TabsTrigger>
              <TabsTrigger value="history">Transaction History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="nfts">
              {!isConnected ? (
                <div className="bg-card border rounded-lg p-8 text-center">
                  <h3 className="text-lg font-medium mb-2">Connect Your Wallet</h3>
                  <p className="text-muted-foreground mb-4">
                    Connect your Ethereum wallet to view your NFT collection.
                  </p>
                  <ConnectWalletButton />
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search NFTs..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2 w-full md:w-auto">
                      <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-full md:w-[180px]">
                          <Filter className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Filter by rarity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Rarities</SelectItem>
                          <SelectItem value="common">Common</SelectItem>
                          <SelectItem value="uncommon">Uncommon</SelectItem>
                          <SelectItem value="rare">Rare</SelectItem>
                          <SelectItem value="epic">Epic</SelectItem>
                          <SelectItem value="legendary">Legendary</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button variant="outline" size="icon" onClick={() => refetch()}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw">
                          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                          <path d="M21 3v5h-5" />
                          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                          <path d="M8 16H3v5" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : error ? (
                    <div className="bg-destructive/10 border-destructive/20 border rounded-lg p-4 text-center">
                      <p className="text-destructive">Error loading NFTs. Please try again.</p>
                    </div>
                  ) : filteredNFTs.length === 0 ? (
                    <div className="bg-card border rounded-lg p-8 text-center">
                      <h3 className="text-lg font-medium mb-2">No NFTs Found</h3>
                      <p className="text-muted-foreground">
                        {searchTerm || filter !== 'all'
                          ? 'No NFTs match your search criteria. Try adjusting your filters.'
                          : 'You don\'t have any NFTs in your wallet yet.'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                        {paginatedNFTs.map((nft) => (
                          <NFTCard 
                            key={`${nft.contractAddress}-${nft.tokenId}`} 
                            {...nft} 
                            onClick={() => handleNFTClick(nft)}
                          />
                        ))}
                      </div>
                      
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex justify-center mt-8">
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={currentPage === 1}
                              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            >
                              Previous
                            </Button>
                            
                            <div className="flex items-center space-x-1">
                              {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(page => {
                                  // Show first page, last page, current page, and pages +/- 1 from current
                                  return (
                                    page === 1 || 
                                    page === totalPages || 
                                    Math.abs(page - currentPage) <= 1
                                  );
                                })
                                .map((page, index, array) => {
                                  // Add ellipsis between non-consecutive pages
                                  const shouldShowEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
                                  
                                  return (
                                    <React.Fragment key={page}>
                                      {shouldShowEllipsisBefore && (
                                        <span className="px-3 py-2 text-muted-foreground">...</span>
                                      )}
                                      <Button
                                        variant={currentPage === page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(page)}
                                        className="w-8 h-8 p-0"
                                      >
                                        {page}
                                      </Button>
                                    </React.Fragment>
                                  );
                                })}
                            </div>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={currentPage === totalPages}
                              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="tokens">
              <div className="bg-card border rounded-lg p-8 text-center">
                <h3 className="text-lg font-medium mb-2">Token Management Coming Soon</h3>
                <p className="text-muted-foreground">
                  This feature is currently under development. Check back soon for updates!
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="history">
              <div className="bg-card border rounded-lg p-8 text-center">
                <h3 className="text-lg font-medium mb-2">Transaction History Coming Soon</h3>
                <p className="text-muted-foreground">
                  View your transaction history and activity. This feature is coming soon!
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}