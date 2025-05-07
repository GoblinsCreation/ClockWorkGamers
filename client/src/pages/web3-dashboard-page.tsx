import { useState, useEffect } from 'react';
import { useWeb3 } from '@/lib/web3/Web3Provider';
import { WalletConnect } from '@/components/web3/WalletConnect';
import { Page } from '@/components/ui/page';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ethers } from 'ethers';
import { CWGCollectionCard } from '@/components/nft/CWGCollectionCard';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Lucide icons
import { 
  Coins,
  RefreshCcw,
  ArrowRightLeft,
  TrendingUp,
  History,
  Plus,
  Info,
  CheckCircle2,
  XCircle,
  Grid3X3, 
  Search, 
  Calendar, 
  Filter, 
  ArrowUpDown,
  Sparkles,
  Wallet,
  Loader2,
  Copy,
  CheckCircle
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Token transaction schema
const transactionFormSchema = z.object({
  recipient: z
    .string()
    .min(1, "Recipient address is required")
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number",
    }),
  token: z.string().min(1, "Token is required"),
  gasOption: z.enum(["slow", "standard", "fast"]),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

// Token balance type
interface TokenBalance {
  name: string;
  symbol: string;
  balance: string;
  value: number;
  change24h: number;
  address: string;
  decimals: number;
  logo: string;
}

// Transaction history type
interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap';
  token: string;
  amount: string;
  from: string;
  to: string;
  timestamp: number;
  status: 'completed' | 'pending' | 'failed';
  hash: string;
}

// Gas price options
interface GasPriceOption {
  label: string;
  value: 'slow' | 'standard' | 'fast';
  time: string;
  price: string;
  priceInGwei: number;
}

// NFT Collection type
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

// Helper function to format addresses
function formatAddress(address: string) {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Helper function to format currency
function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export default function Web3DashboardPage() {
  const { isConnected, address, provider, signer } = useWeb3();
  const [selectedTab, setSelectedTab] = useState('tokens');
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [gasOptions, setGasOptions] = useState<GasPriceOption[]>([
    { label: 'Slow', value: 'slow', time: '~10 min', price: '~$1.50', priceInGwei: 35 },
    { label: 'Standard', value: 'standard', time: '~3 min', price: '~$2.50', priceInGwei: 45 },
    { label: 'Fast', value: 'fast', time: '~30 sec', price: '~$3.50', priceInGwei: 55 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<'pending' | 'completed' | 'failed' | null>(null);
  const { toast } = useToast();
  
  // NFT collections states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<string>('newest');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [selectedCollection, setSelectedCollection] = useState<NFTCollection | null>(null);
  const [isCollectionDetailOpen, setIsCollectionDetailOpen] = useState(false);

  // Set up the form
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      recipient: '',
      amount: '',
      token: '',
      gasOption: 'standard',
    },
  });

  // Generate mock token balances for demo
  useEffect(() => {
    if (isConnected && address) {
      setIsLoading(true);
      
      // Mock tokens
      const mockTokens: TokenBalance[] = [
        {
          name: 'Ethereum',
          symbol: 'ETH',
          balance: '2.45',
          value: 5635.78,
          change24h: 2.34,
          address: '0x0000000000000000000000000000000000000000',
          decimals: 18,
          logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
        },
        {
          name: 'ClockWork Token',
          symbol: 'CWG',
          balance: '12500.00',
          value: 3750.00,
          change24h: 5.67,
          address: '0xCWG1234567890123456789012345678901234567',
          decimals: 18,
          logo: 'https://storage.googleapis.com/replit/images/1746457406177_cwg.gif',
        },
        {
          name: 'USD Coin',
          symbol: 'USDC',
          balance: '1250.00',
          value: 1250.00,
          change24h: 0.01,
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          decimals: 6,
          logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
        },
        {
          name: 'Tether',
          symbol: 'USDT',
          balance: '750.00',
          value: 750.00,
          change24h: 0.00,
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          decimals: 6,
          logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
        },
        {
          name: 'Arbitrum',
          symbol: 'ARB',
          balance: '300.00',
          value: 120.00,
          change24h: -1.23,
          address: '0xFC5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a',
          decimals: 18,
          logo: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
        }
      ];
      
      // Calculate total value
      const total = mockTokens.reduce((acc, token) => acc + token.value, 0);
      setTotalBalance(total);
      
      // Generate mock transaction history
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'receive',
          token: 'ETH',
          amount: '0.5',
          from: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
          to: address,
          timestamp: Date.now() - 86400000, // 1 day ago
          status: 'completed',
          hash: '0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
        },
        {
          id: '2',
          type: 'send',
          token: 'CWG',
          amount: '250',
          from: address,
          to: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
          timestamp: Date.now() - 172800000, // 2 days ago
          status: 'completed',
          hash: '0xabcdef123456789abcdef123456789abcdef123456789abcdef123456789abcd',
        },
        {
          id: '3',
          type: 'swap',
          token: 'ETH',
          amount: '0.1',
          from: address,
          to: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap router
          timestamp: Date.now() - 259200000, // 3 days ago
          status: 'completed',
          hash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
        }
      ];
      
      // Update state
      setTokens(mockTokens);
      setTransactions(mockTransactions);
      setIsLoading(false);
      
      // Set default token for the transaction form
      form.setValue('token', mockTokens[0].address);
      
      // Simulate fetching gas prices
      fetchGasPrices();
    }
  }, [isConnected, address, form]);
  
  // NFT collections data
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
  
  // Fetch gas prices
  const fetchGasPrices = async () => {
    if (provider) {
      try {
        const feeData = await provider.getFeeData();
        const gasPrice = feeData.gasPrice || ethers.parseUnits('50', 'gwei');
        const gasPriceInGwei = parseFloat(ethers.formatUnits(gasPrice, "gwei"));
        
        // Calculate slow, standard, and fast gas prices
        const slow = Math.round(gasPriceInGwei * 0.8);
        const standard = Math.round(gasPriceInGwei);
        const fast = Math.round(gasPriceInGwei * 1.2);
        
        // Estimate transaction costs in dollars (ETH price estimate $2,300)
        const ethPrice = 2300;
        const gasLimit = 21000; // Standard ETH transfer
        
        const calculatePriceInUsd = (gweiPrice: number) => {
          const ethCost = gweiPrice * gasLimit * 1e-9;
          return formatCurrency(ethCost * ethPrice);
        };
        
        setGasOptions([
          { label: 'Slow', value: 'slow', time: '~10 min', price: calculatePriceInUsd(slow), priceInGwei: slow },
          { label: 'Standard', value: 'standard', time: '~3 min', price: calculatePriceInUsd(standard), priceInGwei: standard },
          { label: 'Fast', value: 'fast', time: '~30 sec', price: calculatePriceInUsd(fast), priceInGwei: fast }
        ]);
      } catch (error) {
        console.error('Error fetching gas prices:', error);
      }
    }
  };
  
  // Handle form submission
  async function onSubmit(data: TransactionFormValues) {
    if (!signer || !provider) {
      toast({
        title: "Transaction Failed",
        description: "Wallet connection is required",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    setTransactionStatus('pending');
    
    try {
      const token = tokens.find(t => t.address === data.token);
      
      if (!token) {
        throw new Error("Selected token not found");
      }
      
      // Get gas price based on selection
      const gasOption = gasOptions.find(g => g.value === data.gasOption);
      const gasPrice = ethers.parseUnits(
        gasOption ? gasOption.priceInGwei.toString() : '50',
        'gwei'
      );
      
      // For ETH transfers
      if (token.symbol === 'ETH') {
        const tx = await signer.sendTransaction({
          to: data.recipient,
          value: ethers.parseUnits(data.amount, 18),
          gasPrice,
        });
        
        setTransactionHash(tx.hash);
        
        // Wait for transaction to be mined
        const receipt = await tx.wait();
        
        if (receipt && receipt.status === 1) {
          setTransactionStatus('completed');
          toast({
            title: "Transaction Successful",
            description: `${data.amount} ETH has been sent to ${formatAddress(data.recipient)}`,
          });
          
          // Add to transactions list
          const newTransaction: Transaction = {
            id: Date.now().toString(),
            type: 'send',
            token: 'ETH',
            amount: data.amount,
            from: address!,
            to: data.recipient,
            timestamp: Date.now(),
            status: 'completed',
            hash: tx.hash,
          };
          
          setTransactions(prev => [newTransaction, ...prev]);
          
          // Update token balance (simplified)
          setTokens(prev => 
            prev.map(t => 
              t.symbol === 'ETH' 
                ? { 
                    ...t, 
                    balance: (parseFloat(t.balance) - parseFloat(data.amount)).toFixed(4),
                    value: t.value - (parseFloat(data.amount) * 2300) // Assuming $2300/ETH
                  } 
                : t
            )
          );
          
          // Recalculate total balance
          setTotalBalance(prev => prev - (parseFloat(data.amount) * 2300));
          
          // Reset form and close dialog
          form.reset();
          setIsTransferDialogOpen(false);
        } else {
          setTransactionStatus('failed');
          throw new Error("Transaction failed");
        }
      } else {
        // For token transfers (ERC20)
        // This is just a mock since we're not actually connecting to real tokens
        // In a real app, you would use the token contract and call its transfer method
        
        // Simulate a transaction
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockTxHash = `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
        setTransactionHash(mockTxHash);
        
        // Simulate success after 1 more second
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setTransactionStatus('completed');
        
        toast({
          title: "Transaction Successful",
          description: `${data.amount} ${token.symbol} has been sent to ${formatAddress(data.recipient)}`,
        });
        
        // Add to transactions list
        const newTransaction: Transaction = {
          id: Date.now().toString(),
          type: 'send',
          token: token.symbol,
          amount: data.amount,
          from: address!,
          to: data.recipient,
          timestamp: Date.now(),
          status: 'completed',
          hash: mockTxHash,
        };
        
        setTransactions(prev => [newTransaction, ...prev]);
        
        // Update token balance
        setTokens(prev => 
          prev.map(t => 
            t.symbol === token.symbol 
              ? { 
                  ...t, 
                  balance: (parseFloat(t.balance) - parseFloat(data.amount)).toFixed(2),
                  value: t.value - (parseFloat(data.amount) * (t.value / parseFloat(t.balance)))
                } 
              : t
          )
        );
        
        // Recalculate total balance
        const tokenValuePerUnit = token.value / parseFloat(token.balance);
        setTotalBalance(prev => prev - (parseFloat(data.amount) * tokenValuePerUnit));
        
        // Reset form and close dialog
        form.reset();
        setIsTransferDialogOpen(false);
      }
    } catch (error) {
      console.error("Transaction error:", error);
      setTransactionStatus('failed');
      toast({
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  // Handle collection click
  const handleCollectionClick = (collection: NFTCollection) => {
    setSelectedCollection(collection);
    setIsCollectionDetailOpen(true);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        <Page>
          <PageHeader
            title="Web3 Dashboard"
            description="Manage your cryptocurrency, tokens, and NFT collections"
            icon={<Coins className="h-6 w-6" />}
          />
          
          {!isConnected ? (
            <div className="bg-[hsl(var(--cwg-dark-blue))] border border-[hsl(var(--cwg-blue))] rounded-lg p-8 text-center mt-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Wallet className="h-16 w-16 text-[hsl(var(--cwg-blue))]" />
                <h3 className="text-xl font-bold neon-text-blue">Connect Your Wallet</h3>
                <p className="text-[hsl(var(--cwg-muted))] max-w-md mx-auto mb-4">
                  Connect your Web3 wallet to view your tokens, manage your NFTs, and access all of your blockchain assets.
                </p>
                <WalletConnect />
              </div>
            </div>
          ) : (
            <>
              <Tabs 
                defaultValue={selectedTab} 
                onValueChange={setSelectedTab}
                className="mt-6"
              >
                <TabsList className="mb-4 w-full justify-start bg-[hsl(var(--cwg-dark-blue))] border border-[hsl(var(--cwg-blue))] rounded-lg overflow-x-auto no-scrollbar">
                  <TabsTrigger value="tokens" className="flex-1 data-[state=active]:neon-text-orange">
                    <Coins className="h-5 w-5 mr-2" />
                    <span>Tokens</span>
                  </TabsTrigger>
                  <TabsTrigger value="nfts" className="flex-1 data-[state=active]:neon-text-orange">
                    <Grid3X3 className="h-5 w-5 mr-2" />
                    <span>NFT Collections</span>
                  </TabsTrigger>
                  <TabsTrigger value="transactions" className="flex-1 data-[state=active]:neon-text-orange">
                    <History className="h-5 w-5 mr-2" />
                    <span>Transactions</span>
                  </TabsTrigger>
                </TabsList>
                
                {/* TOKENS TAB */}
                <TabsContent value="tokens" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-blue))]">
                      <CardHeader className="pb-2">
                        <CardTitle>Total Balance</CardTitle>
                        <CardDescription>All tokens combined</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <Skeleton className="h-10 w-full" />
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-3xl font-bold neon-text-blue">
                              {formatCurrency(totalBalance)}
                            </span>
                            <div className="mt-2 flex items-center">
                              <Badge 
                                variant={tokens.reduce((acc, token) => acc + token.change24h, 0) > 0 ? "outline" : "destructive"}
                                className="flex items-center gap-1"
                              >
                                <TrendingUp className="h-3 w-3" />
                                {tokens.reduce((acc, token) => acc + token.change24h, 0).toFixed(2)}%
                              </Badge>
                              <span className="text-sm text-[hsl(var(--cwg-muted))] ml-2">24h</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="pt-0 flex justify-between">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => fetchGasPrices()}
                          className="neon-border-blue"
                        >
                          <RefreshCcw className="h-4 w-4 mr-2" />
                          Refresh
                        </Button>
                        
                        <Button 
                          onClick={() => setIsTransferDialogOpen(true)}
                          className="neon-button-orange"
                        >
                          <ArrowRightLeft className="h-4 w-4 mr-2" />
                          Send
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-blue))] lg:col-span-2">
                      <CardHeader className="pb-2">
                        <CardTitle>Token Distribution</CardTitle>
                        <CardDescription>Breakdown of your token holdings</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-32 w-full" />
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="h-32 flex items-center justify-center">
                              <div className="text-center">
                                <h3 className="text-lg font-medium text-[hsl(var(--cwg-blue))]">Top Tokens</h3>
                                <div className="flex flex-col mt-2 space-y-1">
                                  {tokens.slice(0, 3).map((token) => (
                                    <div key={token.address} className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <div className="h-5 w-5 rounded-full overflow-hidden mr-2 bg-[hsl(var(--cwg-dark))]">
                                          <img 
                                            src={token.logo} 
                                            alt={token.name} 
                                            className="h-full w-full object-cover" 
                                            onError={(e) => {
                                              e.currentTarget.src = 'https://storage.googleapis.com/replit/images/1746457406177_cwg.gif';
                                            }}
                                          />
                                        </div>
                                        <span className="text-sm">{token.symbol}</span>
                                      </div>
                                      <span className="text-sm font-medium">{parseFloat(token.balance).toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <div className="h-32 flex items-center justify-center">
                              <div className="text-center">
                                <h3 className="text-lg font-medium text-[hsl(var(--cwg-blue))]">CWG Token</h3>
                                <div className="mt-2">
                                  <span className="text-2xl font-bold neon-text-orange">
                                    {tokens.find(t => t.symbol === 'CWG')?.balance || '0.00'} CWG
                                  </span>
                                  <div className="mt-1 flex items-center justify-center">
                                    <span className="text-sm text-[hsl(var(--cwg-muted))]">Value: </span>
                                    <span className="text-sm ml-1">
                                      {formatCurrency(tokens.find(t => t.symbol === 'CWG')?.value || 0)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-blue))]">
                    <CardHeader>
                      <CardTitle>Your Tokens</CardTitle>
                      <CardDescription>View and manage your token balances</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="space-y-4">
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="hover:bg-[hsl(var(--cwg-dark-blue))/50]">
                                <TableHead className="w-[100px]">Token</TableHead>
                                <TableHead>Balance</TableHead>
                                <TableHead className="text-right">Value</TableHead>
                                <TableHead className="text-right">Change (24h)</TableHead>
                                <TableHead className="text-right w-[100px]">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {tokens.map((token) => (
                                <TableRow key={token.address} className="hover:bg-[hsl(var(--cwg-dark-blue))/50]">
                                  <TableCell>
                                    <div className="flex items-center">
                                      <div className="h-8 w-8 rounded-full overflow-hidden mr-2 bg-[hsl(var(--cwg-dark))]">
                                        <img 
                                          src={token.logo} 
                                          alt={token.name} 
                                          className="h-full w-full object-cover"
                                          onError={(e) => {
                                            e.currentTarget.src = 'https://storage.googleapis.com/replit/images/1746457406177_cwg.gif';
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <div className="font-medium">{token.symbol}</div>
                                        <div className="text-xs text-[hsl(var(--cwg-muted))]">{token.name}</div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-medium">{token.balance}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(token.value)}</TableCell>
                                  <TableCell className="text-right">
                                    <span className={token.change24h >= 0 ? "text-green-500" : "text-red-500"}>
                                      {token.change24h > 0 ? "+" : ""}{token.change24h.toFixed(2)}%
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => {
                                        form.setValue('token', token.address);
                                        setIsTransferDialogOpen(true);
                                      }}
                                      className="neon-border-blue"
                                    >
                                      Send
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* NFT COLLECTIONS TAB */}
                <TabsContent value="nfts" className="space-y-4">
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row mb-6 gap-4">
                    <div className="relative flex-grow">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--cwg-muted))]" />
                      <Input
                        placeholder="Search collections..."
                        className="pl-10 bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-blue))]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Select value={rarityFilter} onValueChange={setRarityFilter}>
                        <SelectTrigger className="w-[130px] bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-blue))]">
                          <Filter className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-blue))]">
                          <SelectItem value="all">All Rarities</SelectItem>
                          <SelectItem value="common">Common</SelectItem>
                          <SelectItem value="rare">Rare</SelectItem>
                          <SelectItem value="epic">Epic</SelectItem>
                          <SelectItem value="legendary">Legendary</SelectItem>
                          <SelectItem value="mythic">Mythic</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={sortOption} onValueChange={setSortOption}>
                        <SelectTrigger className="w-[130px] bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-blue))]">
                          <ArrowUpDown className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-blue))]">
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
                        }} className="neon-button-blue">
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
                                className="w-full sm:w-auto neon-button-blue"
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
                </TabsContent>
                
                {/* TRANSACTIONS TAB */}
                <TabsContent value="transactions" className="space-y-4">
                  <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-blue))]">
                    <CardHeader>
                      <CardTitle>Transaction History</CardTitle>
                      <CardDescription>Recent token transactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="space-y-4">
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      ) : transactions.length > 0 ? (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="hover:bg-[hsl(var(--cwg-dark-blue))/50]">
                                <TableHead>Type</TableHead>
                                <TableHead>Asset</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>From/To</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {transactions.map((tx) => (
                                <TableRow key={tx.id} className="hover:bg-[hsl(var(--cwg-dark-blue))/50]">
                                  <TableCell>
                                    <Badge variant="outline" className={`
                                      ${tx.type === 'send' ? 'text-red-500 border-red-500' : ''}
                                      ${tx.type === 'receive' ? 'text-green-500 border-green-500' : ''}
                                      ${tx.type === 'swap' ? 'text-blue-500 border-blue-500' : ''}
                                    `}>
                                      {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="font-medium">{tx.token}</TableCell>
                                  <TableCell>
                                    <span className={tx.type === 'send' ? 'text-red-500' : 'text-green-500'}>
                                      {tx.type === 'send' ? '-' : tx.type === 'receive' ? '+' : ''}
                                      {tx.amount} {tx.token}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    {tx.type === 'send' ? (
                                      <div className="flex items-center">
                                        <span className="text-sm">To: </span>
                                        <span className="text-sm font-mono ml-1">{formatAddress(tx.to)}</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center">
                                        <span className="text-sm">From: </span>
                                        <span className="text-sm font-mono ml-1">{formatAddress(tx.from)}</span>
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {new Date(tx.timestamp).toLocaleDateString()} {new Date(tx.timestamp).toLocaleTimeString()}
                                  </TableCell>
                                  <TableCell>
                                    {tx.status === 'completed' && (
                                      <div className="flex items-center">
                                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                                        <span>Completed</span>
                                      </div>
                                    )}
                                    {tx.status === 'pending' && (
                                      <div className="flex items-center">
                                        <Loader2 className="h-4 w-4 text-yellow-500 animate-spin mr-1" />
                                        <span>Pending</span>
                                      </div>
                                    )}
                                    {tx.status === 'failed' && (
                                      <div className="flex items-center">
                                        <XCircle className="h-4 w-4 text-red-500 mr-1" />
                                        <span>Failed</span>
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => {
                                        navigator.clipboard.writeText(tx.hash);
                                        toast({
                                          title: "Hash Copied",
                                          description: "Transaction hash copied to clipboard",
                                        });
                                      }}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-[hsl(var(--cwg-muted))]">No transaction history found.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              
              {/* Transfer Dialog */}
              <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
                <DialogContent className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-blue))]">
                  <DialogHeader>
                    <DialogTitle>Transfer Tokens</DialogTitle>
                    <DialogDescription>
                      Send tokens to another wallet address.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {transactionStatus ? (
                    <div className="py-6 flex flex-col items-center justify-center space-y-4">
                      {transactionStatus === 'pending' && (
                        <>
                          <Loader2 className="h-16 w-16 text-[hsl(var(--cwg-orange))] animate-spin" />
                          <h3 className="text-lg font-medium">Transaction Pending</h3>
                          <p className="text-[hsl(var(--cwg-muted))] text-center max-w-md">
                            Your transaction is being processed. This may take a few moments.
                          </p>
                          {transactionHash && (
                            <div className="flex items-center justify-center mt-2">
                              <span className="text-xs font-mono text-[hsl(var(--cwg-muted))]">
                                {formatAddress(transactionHash)}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(transactionHash);
                                  toast({
                                    title: "Hash Copied",
                                    description: "Transaction hash copied to clipboard",
                                  });
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                      
                      {transactionStatus === 'completed' && (
                        <>
                          <CheckCircle className="h-16 w-16 text-green-500" />
                          <h3 className="text-lg font-medium">Transaction Successful</h3>
                          <p className="text-[hsl(var(--cwg-muted))] text-center max-w-md">
                            Your transaction has been confirmed on the blockchain.
                          </p>
                          {transactionHash && (
                            <div className="flex items-center justify-center mt-2">
                              <span className="text-xs font-mono text-[hsl(var(--cwg-muted))]">
                                {formatAddress(transactionHash)}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(transactionHash);
                                  toast({
                                    title: "Hash Copied",
                                    description: "Transaction hash copied to clipboard",
                                  });
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          <Button 
                            className="mt-4 neon-button-blue"
                            onClick={() => {
                              setTransactionStatus(null);
                              setTransactionHash(null);
                              setIsTransferDialogOpen(false);
                            }}
                          >
                            Close
                          </Button>
                        </>
                      )}
                      
                      {transactionStatus === 'failed' && (
                        <>
                          <XCircle className="h-16 w-16 text-red-500" />
                          <h3 className="text-lg font-medium">Transaction Failed</h3>
                          <p className="text-[hsl(var(--cwg-muted))] text-center max-w-md">
                            There was an error processing your transaction. Please try again.
                          </p>
                          <Button 
                            className="mt-4"
                            variant="destructive"
                            onClick={() => {
                              setTransactionStatus(null);
                              setTransactionHash(null);
                            }}
                          >
                            Try Again
                          </Button>
                        </>
                      )}
                    </div>
                  ) : (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="token"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Token</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-[hsl(var(--cwg-dark))]">
                                    <SelectValue placeholder="Select token" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-[hsl(var(--cwg-dark-blue))]">
                                  {tokens.map((token) => (
                                    <SelectItem key={token.address} value={token.address}>
                                      <div className="flex items-center">
                                        <div className="h-5 w-5 rounded-full overflow-hidden mr-2 bg-[hsl(var(--cwg-dark))]">
                                          <img 
                                            src={token.logo} 
                                            alt={token.name} 
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                              e.currentTarget.src = 'https://storage.googleapis.com/replit/images/1746457406177_cwg.gif';
                                            }}
                                          />
                                        </div>
                                        <span>
                                          {token.symbol} - Balance: {token.balance}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="recipient"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Recipient Address</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="0x..." 
                                  {...field} 
                                  className="bg-[hsl(var(--cwg-dark))]"
                                />
                              </FormControl>
                              <FormDescription>
                                Enter a valid Ethereum address.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amount</FormLabel>
                              <FormControl>
                                <Input 
                                  type="text" 
                                  placeholder="0.0" 
                                  {...field} 
                                  className="bg-[hsl(var(--cwg-dark))]"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="gasOption"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Transaction Speed</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-[hsl(var(--cwg-dark))]">
                                    <SelectValue placeholder="Select gas option" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-[hsl(var(--cwg-dark-blue))]">
                                  {gasOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      <div className="flex items-center justify-between w-full">
                                        <span>{option.label}</span>
                                        <div className="text-right">
                                          <div className="text-xs">{option.time}</div>
                                          <div className="text-xs text-[hsl(var(--cwg-muted))]">{option.price}</div>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsTransferDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={isSubmitting || !isConnected}
                            className="neon-button-blue"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              'Send Tokens'
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  )}
                </DialogContent>
              </Dialog>
            </>
          )}
        </Page>
      </div>
      <Footer />
    </div>
  );
}