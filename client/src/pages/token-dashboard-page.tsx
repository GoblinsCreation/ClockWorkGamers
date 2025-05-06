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
import { formatEther, formatUnits, parseUnits } from '@ethersproject/units';
import { 
  Coins,
  RefreshCcw,
  ArrowRightLeft,
  TrendingUp,
  History,
  Plus,
  Info,
  CheckCircle2,
  XCircle
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

export default function TokenDashboardPage() {
  const { isConnected, address, provider, signer } = useWeb3();
  const [selectedTab, setSelectedTab] = useState('holdings');
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
          logo: 'https://via.placeholder.com/40/FF6700/FFFFFF?text=CWG',
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
  
  // Fetch gas prices
  const fetchGasPrices = async () => {
    if (provider) {
      try {
        const feeData = await provider.getFeeData();
        const gasPrice = feeData.gasPrice || ethers.parseUnits('50', 'gwei');
        const gasPriceInGwei = parseFloat(formatUnits(gasPrice, "gwei"));
        
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
        
        if (receipt.status === 1) {
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
  
  return (
    <Page>
      <PageHeader
        title="Token Dashboard"
        description="Manage your cryptocurrency assets and track token balances"
        icon={<Coins className="h-6 w-6" />}
      />
      
      {isConnected ? (
        <>
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
              <CardFooter>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => setIsTransferDialogOpen(true)}
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                    Transfer
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    Buy
                  </Button>
                </div>
              </CardFooter>
            </Card>
            
            <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-blue))] lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle>CWG Token Staking</CardTitle>
                <CardDescription>Earn rewards by staking CWG tokens</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-24 w-full" />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-[hsl(var(--cwg-dark))] border border-[hsl(var(--cwg-blue))/20] flex flex-col">
                      <span className="text-sm text-[hsl(var(--cwg-muted))]">Available to Stake</span>
                      <span className="text-xl font-bold neon-text-blue mt-1">12,500 CWG</span>
                    </div>
                    <div className="p-4 rounded-lg bg-[hsl(var(--cwg-dark))] border border-[hsl(var(--cwg-blue))/20] flex flex-col">
                      <span className="text-sm text-[hsl(var(--cwg-muted))]">Staked Amount</span>
                      <span className="text-xl font-bold neon-text-blue mt-1">0 CWG</span>
                    </div>
                    <div className="p-4 rounded-lg bg-[hsl(var(--cwg-dark))] border border-[hsl(var(--cwg-blue))/20] flex flex-col">
                      <span className="text-sm text-[hsl(var(--cwg-muted))]">Rewards APR</span>
                      <span className="text-xl font-bold text-green-500 mt-1">12.5%</span>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button>Stake CWG Tokens</Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-blue))] rounded-lg p-6">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <div className="flex items-center justify-between mb-6">
                <TabsList>
                  <TabsTrigger value="holdings">Holdings</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                </TabsList>
                <Button variant="outline" size="sm" onClick={fetchGasPrices} className="flex items-center gap-1">
                  <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              
              <TabsContent value="holdings" className="space-y-4">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Token</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>24h Change</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tokens.map((token) => (
                        <TableRow key={token.address}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <img
                                src={token.logo}
                                alt={token.name}
                                className="h-6 w-6 rounded-full"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/40/FF6700/FFFFFF?text=' + token.symbol.substring(0, 3);
                                }}
                              />
                              <div>
                                <div className="font-medium">{token.name}</div>
                                <div className="text-xs text-[hsl(var(--cwg-muted))]">{token.symbol}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono font-medium">{token.balance}</div>
                          </TableCell>
                          <TableCell>{formatCurrency(token.value)}</TableCell>
                          <TableCell>
                            <span className={token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}>
                              {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="mr-2"
                              onClick={() => {
                                form.setValue('token', token.address);
                                setIsTransferDialogOpen(true);
                              }}
                            >
                              Send
                            </Button>
                            <Button variant="outline" size="sm">
                              Swap
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
              
              <TabsContent value="transactions">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>From/To</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.length > 0 ? (
                        transactions.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell>
                              <Badge
                                variant={
                                  tx.type === 'receive' ? 'outline' :
                                  tx.type === 'send' ? 'secondary' : 'default'
                                }
                              >
                                {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {tx.type === 'receive' ? '+' : '-'} {tx.amount} {tx.token}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {tx.type === 'receive' ? 'From: ' : 'To: '}
                                <span className="font-mono">
                                  {formatAddress(tx.type === 'receive' ? tx.from : tx.to)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(tx.timestamp).toLocaleDateString()} {new Date(tx.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  tx.status === 'completed' ? 'outline' :
                                  tx.status === 'pending' ? 'secondary' : 'destructive'
                                }
                                className="flex items-center gap-1"
                              >
                                {tx.status === 'completed' ? <CheckCircle2 className="h-3 w-3" /> : 
                                 tx.status === 'pending' ? <RefreshCcw className="h-3 w-3" /> : 
                                 <XCircle className="h-3 w-3" />}
                                {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  window.open(`https://etherscan.io/tx/${tx.hash}`, '_blank');
                                }}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            <div className="text-[hsl(var(--cwg-muted))]">No transactions yet</div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Transfer Token Dialog */}
          <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
            <DialogContent className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-blue))]">
              <DialogHeader>
                <DialogTitle className="neon-text-blue text-2xl font-orbitron">Transfer Tokens</DialogTitle>
                <DialogDescription>
                  Send tokens to another wallet address
                </DialogDescription>
              </DialogHeader>
              
              {!transactionStatus ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="token"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Token</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a token" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-blue))]">
                              {tokens.map((token) => (
                                <SelectItem key={token.address} value={token.address}>
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={token.logo}
                                      alt={token.name}
                                      className="h-4 w-4 rounded-full"
                                      onError={(e) => {
                                        e.currentTarget.src = 'https://via.placeholder.com/40/FF6700/FFFFFF?text=' + token.symbol.substring(0, 3);
                                      }}
                                    />
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
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input {...field} placeholder="0.00" />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 text-xs px-2"
                                onClick={() => {
                                  const selectedToken = tokens.find(t => t.address === form.getValues('token'));
                                  if (selectedToken) {
                                    field.onChange(selectedToken.balance);
                                  }
                                }}
                              >
                                MAX
                              </Button>
                            </div>
                          </FormControl>
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
                            <Input {...field} placeholder="0x..." />
                          </FormControl>
                          <FormDescription>
                            Enter a valid Ethereum wallet address
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="gasOption"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gas Price</FormLabel>
                          <div className="grid grid-cols-3 gap-2">
                            {gasOptions.map((option) => (
                              <div
                                key={option.value}
                                className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                                  field.value === option.value
                                    ? 'bg-[hsl(var(--cwg-blue))/20] border-[hsl(var(--cwg-blue))]'
                                    : 'bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-blue))/20]'
                                }`}
                                onClick={() => field.onChange(option.value)}
                              >
                                <div className="font-medium mb-1">{option.label}</div>
                                <div className="text-xs text-[hsl(var(--cwg-muted))]">
                                  {option.time}
                                </div>
                                <div className="text-xs text-[hsl(var(--cwg-muted))]">
                                  {option.price}
                                </div>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Send Tokens'
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              ) : (
                <div className="py-6">
                  <div className="flex flex-col items-center justify-center text-center space-y-4">
                    {transactionStatus === 'pending' && (
                      <>
                        <RefreshCcw className="h-12 w-12 animate-spin text-[hsl(var(--cwg-blue))]" />
                        <h3 className="text-xl font-medium">Transaction in Progress</h3>
                        <p className="text-[hsl(var(--cwg-muted))] max-w-md">
                          Your transaction is being processed on the blockchain. This may take a few moments.
                        </p>
                      </>
                    )}
                    
                    {transactionStatus === 'completed' && (
                      <>
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                        <h3 className="text-xl font-medium">Transaction Completed</h3>
                        <p className="text-[hsl(var(--cwg-muted))] max-w-md">
                          Your transaction has been confirmed on the blockchain.
                        </p>
                      </>
                    )}
                    
                    {transactionStatus === 'failed' && (
                      <>
                        <XCircle className="h-12 w-12 text-red-500" />
                        <h3 className="text-xl font-medium">Transaction Failed</h3>
                        <p className="text-[hsl(var(--cwg-muted))] max-w-md">
                          Your transaction could not be completed. Please try again.
                        </p>
                      </>
                    )}
                    
                    {transactionHash && (
                      <div className="p-3 bg-[hsl(var(--cwg-dark))] rounded-lg w-full mt-4">
                        <div className="text-xs text-[hsl(var(--cwg-muted))] mb-1">Transaction Hash:</div>
                        <div className="font-mono text-sm break-all">{transactionHash}</div>
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-2 text-[hsl(var(--cwg-blue))] p-0 h-auto"
                          onClick={() => {
                            window.open(`https://etherscan.io/tx/${transactionHash}`, '_blank');
                          }}
                        >
                          View on Etherscan
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <DialogFooter className="mt-6">
                    <Button onClick={() => {
                      setTransactionStatus(null);
                      setTransactionHash(null);
                      if (transactionStatus === 'completed') {
                        setIsTransferDialogOpen(false);
                      }
                    }}>
                      {transactionStatus === 'completed' ? 'Close' : 'Try Again'}
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <div className="bg-[hsl(var(--cwg-dark-blue))] border border-[hsl(var(--cwg-blue))] rounded-lg p-8 flex flex-col items-center justify-center text-center space-y-6">
          <div className="bg-[hsl(var(--cwg-dark))] p-4 rounded-full">
            <Coins className="h-12 w-12 text-[hsl(var(--cwg-muted))]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold neon-text-blue mb-2">Connect Your Wallet</h2>
            <p className="text-[hsl(var(--cwg-muted))] max-w-md mx-auto">
              Connect your Web3 wallet to view your token balances, transfer assets, and manage your cryptocurrency portfolio.
            </p>
          </div>
          
          <div className="w-full max-w-xs">
            <WalletConnect />
          </div>
          
          <div className="p-4 bg-[hsl(var(--cwg-dark))] rounded-lg flex items-start gap-3 max-w-lg text-left">
            <Info className="h-5 w-5 text-[hsl(var(--cwg-blue))] mt-0.5" />
            <div>
              <h3 className="font-medium text-[hsl(var(--cwg-blue))]">Why connect a wallet?</h3>
              <p className="text-sm text-[hsl(var(--cwg-muted))]">
                Connecting your Web3 wallet allows you to manage your cryptocurrency assets, participate in CWG token staking, and unlock special features within the ClockWork Gamers ecosystem.
              </p>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}