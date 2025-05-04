import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/hooks/use-web3";
import { Loader2, Tag, Filter, Grid3X3, Gift, ShoppingCart } from "lucide-react";
import { formatEthereumAddress } from "@/lib/utils";
import { Link } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Temporary NFT data while we build out the system
const SAMPLE_NFTS = [
  {
    id: 1,
    name: "Dragon Slayer Sword",
    description: "Legendary weapon that deals extra damage to dragon enemies",
    image: "https://placehold.co/300x300/252634/00A3FF?text=⚔️&font=montserrat",
    price: "0.15",
    rarity: "Legendary",
    game: "Crypto Legends",
    owner: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  },
  {
    id: 2, 
    name: "Space Cruiser X7",
    description: "Fast interplanetary vehicle with enhanced shield capabilities",
    image: "https://placehold.co/300x300/252634/00A3FF?text=🚀&font=montserrat",
    price: "0.25",
    rarity: "Epic",
    game: "Galaxy Raiders",
    owner: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  },
  {
    id: 3,
    name: "Fire Mage Helmet",
    description: "Increases fire spell damage by 15%",
    image: "https://placehold.co/300x300/252634/FF6B00?text=🔥&font=montserrat",
    price: "0.08",
    rarity: "Rare",
    game: "Crypto Legends",
    owner: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
  },
  {
    id: 4,
    name: "Stealth Drone",
    description: "Invisible reconnaissance unit that can spy on enemies",
    image: "https://placehold.co/300x300/252634/00A3FF?text=🛸&font=montserrat",
    price: "0.12",
    rarity: "Epic",
    game: "Galaxy Raiders",
    owner: "0x90F79bf6EB2c4f870365E785982E1f101E93b906"
  },
  {
    id: 5,
    name: "Titan Slayer Axe",
    description: "Massive battle axe that can stun titan enemies",
    image: "https://placehold.co/300x300/252634/FF6B00?text=🪓&font=montserrat",
    price: "0.18",
    rarity: "Legendary",
    game: "Boss Fighters",
    owner: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
  },
  {
    id: 6,
    name: "Healing Amulet",
    description: "Regenerates health during battle",
    image: "https://placehold.co/300x300/252634/00A3FF?text=✨&font=montserrat",
    price: "0.05",
    rarity: "Uncommon",
    game: "Crypto Legends",
    owner: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc"
  }
];

// Rarity color mapping
const rarityColors: Record<string, string> = {
  "Common": "bg-gray-500",
  "Uncommon": "bg-green-500",
  "Rare": "bg-blue-500",
  "Epic": "bg-purple-500",
  "Legendary": "bg-[hsl(var(--cwg-orange))]"
};

export default function NFTMarketplacePage() {
  const { account, connected } = useWeb3();
  const [selectedGame, setSelectedGame] = useState<string>("all");
  const [selectedRarity, setSelectedRarity] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Filter NFTs based on selected filters
  const filteredNFTs = SAMPLE_NFTS.filter(nft => {
    // Filter by game
    if (selectedGame !== "all" && nft.game !== selectedGame) {
      return false;
    }
    
    // Filter by rarity
    if (selectedRarity !== "all" && nft.rarity !== selectedRarity) {
      return false;
    }
    
    // Filter by ownership/tab
    if (activeTab === "owned" && nft.owner !== account) {
      return false;
    }
    
    return true;
  });

  // Mock loading effect when changing filters
  const applyFilters = (game: string, rarity: string) => {
    setIsLoading(true);
    setSelectedGame(game);
    setSelectedRarity(rarity);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const NFTCard = ({ nft }: { nft: typeof SAMPLE_NFTS[0] }) => {
    const isOwned = nft.owner === account;
    
    return (
      <div className="bg-[hsl(var(--cwg-dark-blue))]/30 rounded-lg overflow-hidden border border-[hsl(var(--cwg-dark-blue))] hover:border-[hsl(var(--cwg-blue))] transition-all">
        <div className="h-48 overflow-hidden relative">
          <img 
            src={nft.image} 
            alt={nft.name} 
            className="w-full h-full object-cover" 
          />
          <div className={`absolute top-2 right-2 ${rarityColors[nft.rarity]} text-white text-xs px-2 py-1 rounded`}>
            {nft.rarity}
          </div>
          {isOwned && (
            <div className="absolute top-2 left-2 bg-[hsl(var(--cwg-blue))] text-white text-xs px-2 py-1 rounded">
              Owned
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-[hsl(var(--cwg-dark))]/80 text-white text-xs px-2 py-1 rounded">
            {nft.game}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-orbitron text-[hsl(var(--cwg-text))] mb-1">{nft.name}</h3>
          <p className="text-xs text-[hsl(var(--cwg-muted))] mb-3">{nft.description}</p>
          
          <div className="flex justify-between items-center mt-auto">
            <div className="text-[hsl(var(--cwg-blue))] font-orbitron">
              {nft.price} ETH
            </div>
            
            {isOwned ? (
              <Button size="sm" variant="outline" className="text-xs border-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-orange))]">
                <Gift className="h-3 w-3 mr-1" /> Transfer
              </Button>
            ) : (
              <Button size="sm" className="text-xs bg-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-dark))]">
                <ShoppingCart className="h-3 w-3 mr-1" /> Buy
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[hsl(var(--cwg-dark))]">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-[hsl(var(--cwg-blue))]/20 to-[hsl(var(--cwg-orange))]/20 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:flex lg:items-center lg:justify-between">
              <div className="lg:max-w-2xl">
                <h1 className="text-3xl font-bold font-orbitron tracking-tight text-[hsl(var(--cwg-text))] sm:text-4xl">
                  NFT Marketplace
                </h1>
                <p className="mt-3 text-xl text-[hsl(var(--cwg-muted))]">
                  Discover, collect, and trade unique in-game assets from ClockWork Gamers ecosystem
                </p>
                
                <div className="mt-6 flex flex-wrap gap-4">
                  {!connected ? (
                    <div>
                      <p className="text-sm text-[hsl(var(--cwg-muted))] mb-2">Connect your wallet to start trading</p>
                      <Link href="/">
                        <Button className="bg-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-dark))]">
                          Connect Wallet
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-[hsl(var(--cwg-muted))] mb-2">Connected as</p>
                      <div className="text-[hsl(var(--cwg-blue))] font-orbitron">
                        {formatEthereumAddress(account || '')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-8 lg:mt-0">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="bg-[hsl(var(--cwg-dark-blue))]/50 p-4 rounded-lg text-center min-w-[100px]">
                    <div className="text-3xl font-orbitron text-[hsl(var(--cwg-blue))]">235</div>
                    <div className="text-xs text-[hsl(var(--cwg-muted))]">Total NFTs</div>
                  </div>
                  <div className="bg-[hsl(var(--cwg-dark-blue))]/50 p-4 rounded-lg text-center min-w-[100px]">
                    <div className="text-3xl font-orbitron text-[hsl(var(--cwg-orange))]">45</div>
                    <div className="text-xs text-[hsl(var(--cwg-muted))]">Players</div>
                  </div>
                  <div className="bg-[hsl(var(--cwg-dark-blue))]/50 p-4 rounded-lg text-center min-w-[100px]">
                    <div className="text-3xl font-orbitron text-[hsl(var(--cwg-blue))]">3</div>
                    <div className="text-xs text-[hsl(var(--cwg-muted))]">Games</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <Tabs 
                value={activeTab} 
                onValueChange={(value) => {
                  setActiveTab(value);
                  setIsLoading(true);
                  setTimeout(() => setIsLoading(false), 500);
                }}
                className="w-full md:w-auto"
              >
                <TabsList className="grid w-full md:w-auto grid-cols-2">
                  <TabsTrigger value="all">All NFTs</TabsTrigger>
                  <TabsTrigger value="owned" disabled={!connected}>My Collection</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-auto">
                  <Select 
                    value={selectedGame} 
                    onValueChange={(value) => applyFilters(value, selectedRarity)}
                  >
                    <SelectTrigger className="w-full sm:w-[180px] bg-[hsl(var(--cwg-dark-blue))]/30">
                      <SelectValue placeholder="Game" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Games</SelectItem>
                      <SelectItem value="Crypto Legends">Crypto Legends</SelectItem>
                      <SelectItem value="Galaxy Raiders">Galaxy Raiders</SelectItem>
                      <SelectItem value="Boss Fighters">Boss Fighters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full sm:w-auto">
                  <Select 
                    value={selectedRarity} 
                    onValueChange={(value) => applyFilters(selectedGame, value)}
                  >
                    <SelectTrigger className="w-full sm:w-[180px] bg-[hsl(var(--cwg-dark-blue))]/30">
                      <SelectValue placeholder="Rarity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Rarities</SelectItem>
                      <SelectItem value="Common">Common</SelectItem>
                      <SelectItem value="Uncommon">Uncommon</SelectItem>
                      <SelectItem value="Rare">Rare</SelectItem>
                      <SelectItem value="Epic">Epic</SelectItem>
                      <SelectItem value="Legendary">Legendary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button variant="outline" className="bg-transparent border-[hsl(var(--cwg-dark-blue))]">
                  <Filter className="h-4 w-4 mr-2" /> More Filters
                </Button>
                
                <Button variant="outline" className="bg-transparent border-[hsl(var(--cwg-dark-blue))]">
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--cwg-blue))]" />
              </div>
            ) : filteredNFTs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredNFTs.map((nft) => (
                  <NFTCard key={nft.id} nft={nft} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Tag className="h-12 w-12 mx-auto text-[hsl(var(--cwg-muted))]" />
                <h3 className="mt-4 text-lg font-orbitron text-[hsl(var(--cwg-text))]">No NFTs Found</h3>
                <p className="mt-2 text-[hsl(var(--cwg-muted))]">Try changing your filters or check back later</p>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}