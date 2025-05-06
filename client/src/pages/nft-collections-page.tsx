import { useState } from 'react';
import { Page } from '@/components/ui/page';
import { PageHeader } from '@/components/ui/page-header';
import { CWGCollectionCard } from '@/components/nft/CWGCollectionCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Grid3X3, 
  Search, 
  Calendar, 
  Filter, 
  ArrowUpDown,
  Sparkles
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

interface NFTCollection {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  totalSupply: number;
  mintedCount: number;
  ownerCount: number;
  floorPrice?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  benefits: string[];
  mintLink?: string;
}

export default function NFTCollectionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<string>('newest');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [selectedCollection, setSelectedCollection] = useState<NFTCollection | null>(null);
  const [isCollectionDetailOpen, setIsCollectionDetailOpen] = useState(false);
  
  // Guild NFT collections
  const collections: NFTCollection[] = [
    {
      id: '1',
      name: 'CWG Founder\'s Pass',
      description: 'Limited edition NFT for ClockWork Gamers founding members. Grants exclusive access to founder events and premium features.',
      imageUrl: 'https://storage.googleapis.com/replit/images/1746457406177_cwg.gif',
      totalSupply: 100,
      mintedCount: 92,
      ownerCount: 87,
      floorPrice: 0.5,
      rarity: 'legendary',
      benefits: [
        'Lifetime access to premium features',
        'Voting rights in guild governance',
        'Early access to new games and tournaments',
        'Founder badge in chat and forums',
        'Monthly ETH dividends from guild profits'
      ],
      mintLink: 'https://opensea.io/collection/cwg-founders'
    },
    {
      id: '2',
      name: 'Geared Guardians',
      description: 'Mechanical warriors defending the crypto realm. Each Guardian comes with unique powers and abilities for CWG-affiliated games.',
      imageUrl: 'https://images.unsplash.com/photo-1635899888025-c7f292d58139',
      totalSupply: 5000,
      mintedCount: 2871,
      ownerCount: 1403,
      floorPrice: 0.08,
      rarity: 'rare',
      benefits: [
        'Special character skins in CWG games',
        'Increased rewards in Play-to-Earn games',
        'Access to Guardian-only tournaments',
        'Special role in Discord server'
      ]
    },
    {
      id: '3',
      name: 'Chrono Constructs',
      description: 'Time-manipulating clockwork entities from the CWG universe. Collect and combine to unlock powerful abilities in the metaverse.',
      imageUrl: 'https://images.unsplash.com/photo-1633432695394-a74b996c0aad',
      totalSupply: 10000,
      mintedCount: 3254,
      ownerCount: 1876,
      rarity: 'common',
      benefits: [
        'Playable characters in CWG metaverse',
        'Daily token rewards for holders',
        'Access to clockwork crafting system'
      ]
    },
    {
      id: '4',
      name: 'Ethereal Esports Elite',
      description: 'Legendary players immortalized in NFT form. Each card contains tournament moments and special powers for competitive gaming.',
      imageUrl: 'https://images.unsplash.com/photo-1519326882834-04c334752f58',
      totalSupply: 250,
      mintedCount: 84,
      ownerCount: 54,
      floorPrice: 0.34,
      rarity: 'epic',
      benefits: [
        'Access to pro coaching sessions',
        'Priority registration for tournaments',
        'Revenue share from esports events',
        'Exclusive in-game cosmetics',
        'Voting rights for team decisions'
      ]
    },
    {
      id: '5',
      name: 'Quantum Quests',
      description: 'Interactive quest cards that evolve based on holder actions. Complete challenges to level up your NFT and unlock new abilities.',
      imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e',
      totalSupply: 3000,
      mintedCount: 872,
      ownerCount: 621,
      rarity: 'rare',
      benefits: [
        'Evolving artwork as quests are completed',
        'Special access to gaming quests',
        'Bonus rewards for quest completion',
        'Unlockable lore and story content'
      ]
    },
    {
      id: '6',
      name: 'CWG Genesis',
      description: 'The first-ever NFT collection from ClockWork Gamers. Own a piece of guild history with these ultra-rare digital artifacts.',
      imageUrl: 'https://images.unsplash.com/photo-1610812387871-fda0609af956',
      totalSupply: 50,
      mintedCount: 50,
      ownerCount: 36,
      floorPrice: 1.2,
      rarity: 'mythic',
      benefits: [
        'Lifetime access to all CWG services',
        'VIP access to physical events',
        'Monthly airdrops of premium content',
        'Priority support channel',
        'Name in CWG Hall of Fame',
        'Revenue share from all CWG projects'
      ]
    }
  ];
  
  // Filter and sort collections
  const filteredAndSortedCollections = collections
    // Filter by search
    .filter(collection => 
      !searchQuery || 
      collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    // Filter by rarity
    .filter(collection => 
      rarityFilter === 'all' || 
      collection.rarity === rarityFilter
    )
    // Sort
    .sort((a, b) => {
      switch(sortOption) {
        case 'newest':
          return parseInt(b.id) - parseInt(a.id);
        case 'oldest':
          return parseInt(a.id) - parseInt(b.id);
        case 'supply-high':
          return b.totalSupply - a.totalSupply;
        case 'supply-low':
          return a.totalSupply - b.totalSupply;
        case 'rarity-high': {
          const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3, mythic: 4 };
          return (rarityOrder[b.rarity as keyof typeof rarityOrder]) - 
                 (rarityOrder[a.rarity as keyof typeof rarityOrder]);
        }
        case 'rarity-low': {
          const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3, mythic: 4 };
          return (rarityOrder[a.rarity as keyof typeof rarityOrder]) - 
                 (rarityOrder[b.rarity as keyof typeof rarityOrder]);
        }
        default:
          return 0;
      }
    });
  
  // Handle collection click
  const handleCollectionClick = (collection: NFTCollection) => {
    setSelectedCollection(collection);
    setIsCollectionDetailOpen(true);
  };
  
  return (
    <Page>
      <PageHeader
        title="Guild NFT Collections"
        description="Exclusive NFT collections from ClockWork Gamers"
        icon={<Grid3X3 className="h-6 w-6" />}
      />
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row mb-6 gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--cwg-muted))]" />
          <Input
            placeholder="Search collections..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={rarityFilter} onValueChange={setRarityFilter}>
            <SelectTrigger className="w-[130px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rarities</SelectItem>
              <SelectItem value="common">Common</SelectItem>
              <SelectItem value="rare">Rare</SelectItem>
              <SelectItem value="epic">Epic</SelectItem>
              <SelectItem value="legendary">Legendary</SelectItem>
              <SelectItem value="mythic">Mythic</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[130px]">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="supply-high">Highest Supply</SelectItem>
              <SelectItem value="supply-low">Lowest Supply</SelectItem>
              <SelectItem value="rarity-high">Highest Rarity</SelectItem>
              <SelectItem value="rarity-low">Lowest Rarity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Collections Grid */}
      {filteredAndSortedCollections.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedCollections.map((collection) => (
            <CWGCollectionCard
              key={collection.id}
              collectionId={collection.id}
              name={collection.name}
              description={collection.description}
              imageUrl={collection.imageUrl}
              totalSupply={collection.totalSupply}
              mintedCount={collection.mintedCount}
              ownerCount={collection.ownerCount}
              floorPrice={collection.floorPrice}
              rarity={collection.rarity}
              benefits={collection.benefits}
              mintLink={collection.mintLink}
              onClick={() => handleCollectionClick(collection)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[hsl(var(--cwg-dark-blue))] border border-[hsl(var(--cwg-blue))] rounded-lg p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Sparkles className="h-12 w-12 text-[hsl(var(--cwg-muted))]" />
            <h3 className="text-xl font-medium">No Collections Found</h3>
            <p className="text-[hsl(var(--cwg-muted))] max-w-md mx-auto">
              No NFT collections match your search criteria. Try adjusting your filters or search term.
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setRarityFilter('all');
              setSortOption('newest');
            }}>
              Clear Filters
            </Button>
          </div>
        </div>
      )}
      
      {/* Collection Detail Dialog */}
      {selectedCollection && (
        <Dialog open={isCollectionDetailOpen} onOpenChange={setIsCollectionDetailOpen}>
          <DialogContent className="max-w-3xl bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-blue))]">
            <DialogHeader>
              <DialogTitle className="neon-text-blue text-2xl font-orbitron">{selectedCollection.name}</DialogTitle>
              <DialogDescription>
                CWG Exclusive NFT Collection
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="aspect-square overflow-hidden rounded-lg border border-[hsl(var(--cwg-blue))/20] bg-[hsl(var(--cwg-dark))]">
                <img 
                  src={selectedCollection.imageUrl} 
                  alt={selectedCollection.name} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    e.currentTarget.src = 'https://storage.googleapis.com/replit/images/1746457406177_cwg.gif';
                  }}
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Description</h3>
                  <p className="mt-1">{selectedCollection.description}</p>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Collection Details</h3>
                  <div className="grid grid-cols-2 gap-3 bg-[hsl(var(--cwg-dark))] p-3 rounded-lg">
                    <div>
                      <div className="text-xs text-[hsl(var(--cwg-muted))]">Total Supply</div>
                      <div className="font-semibold">{selectedCollection.totalSupply}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[hsl(var(--cwg-muted))]">Minted</div>
                      <div className="font-semibold">{selectedCollection.mintedCount}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[hsl(var(--cwg-muted))]">Owners</div>
                      <div className="font-semibold">{selectedCollection.ownerCount}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[hsl(var(--cwg-muted))]">Floor Price</div>
                      <div className="font-semibold">
                        {selectedCollection.floorPrice ? `${selectedCollection.floorPrice} ETH` : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Benefits</h3>
                  <ul className="mt-2 space-y-1 list-disc pl-5">
                    {selectedCollection.benefits.map((benefit, index) => (
                      <li key={index} className="text-sm">{benefit}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Rarity</h3>
                  <div className="mt-1">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium
                      ${selectedCollection.rarity === 'common' ? 'bg-zinc-500 text-zinc-50' : ''}
                      ${selectedCollection.rarity === 'rare' ? 'bg-blue-500 text-blue-50' : ''}
                      ${selectedCollection.rarity === 'epic' ? 'bg-purple-500 text-purple-50' : ''}
                      ${selectedCollection.rarity === 'legendary' ? 'bg-amber-500 text-amber-50' : ''}
                      ${selectedCollection.rarity === 'mythic' ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white' : ''}
                    `}>
                      {selectedCollection.rarity.charAt(0).toUpperCase() + selectedCollection.rarity.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              {selectedCollection.mintedCount < selectedCollection.totalSupply ? (
                selectedCollection.mintLink ? (
                  <Button 
                    onClick={() => window.open(selectedCollection.mintLink, '_blank')}
                    className="w-full sm:w-auto"
                  >
                    Mint NFT
                  </Button>
                ) : (
                  <Button disabled className="w-full sm:w-auto">Coming Soon</Button>
                )
              ) : (
                <Button variant="outline" disabled className="w-full sm:w-auto">Sold Out</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Page>
  );
}