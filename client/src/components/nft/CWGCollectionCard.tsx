import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Users, Trophy, ChevronRight, Info } from 'lucide-react';
import cwgGif from '@assets/cwg.gif';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CWGCollectionCardProps {
  collectionId: string;
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
  onClick?: () => void;
}

export function CWGCollectionCard({
  collectionId,
  name,
  description,
  imageUrl,
  totalSupply,
  mintedCount,
  ownerCount,
  floorPrice,
  rarity,
  benefits,
  mintLink,
  onClick
}: CWGCollectionCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  
  // Animate progress bar on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressValue((mintedCount / totalSupply) * 100);
    }, 200);
    return () => clearTimeout(timer);
  }, [mintedCount, totalSupply]);

  // Get rarity-based styling
  const getRarityStyle = () => {
    switch(rarity) {
      case 'common':
        return {
          borderColor: 'border-zinc-500',
          glowColor: 'shadow-zinc-500/20',
          badgeColor: 'bg-zinc-500 text-zinc-50',
          gradientFrom: 'from-zinc-500/10',
          gradientTo: 'to-zinc-500/5'
        };
      case 'rare':
        return {
          borderColor: 'border-blue-500',
          glowColor: 'shadow-blue-500/20',
          badgeColor: 'bg-blue-500 text-blue-50',
          gradientFrom: 'from-blue-500/10',
          gradientTo: 'to-blue-500/5'
        };
      case 'epic':
        return {
          borderColor: 'border-purple-500',
          glowColor: 'shadow-purple-500/40',
          badgeColor: 'bg-purple-500 text-purple-50',
          gradientFrom: 'from-purple-500/20',
          gradientTo: 'to-purple-500/5'
        };
      case 'legendary':
        return {
          borderColor: 'border-amber-500',
          glowColor: 'shadow-amber-500/40',
          badgeColor: 'bg-amber-500 text-amber-50',
          gradientFrom: 'from-amber-500/20',
          gradientTo: 'to-amber-500/5'
        };
      case 'mythic':
        return {
          borderColor: 'border-rose-500',
          glowColor: 'shadow-rose-500/40',
          badgeColor: 'bg-gradient-to-r from-rose-500 to-orange-500 text-white',
          gradientFrom: 'from-rose-500/20',
          gradientTo: 'to-orange-500/10'
        };
      default:
        return {
          borderColor: 'border-blue-500',
          glowColor: 'shadow-blue-500/20',
          badgeColor: 'bg-blue-500 text-blue-50',
          gradientFrom: 'from-blue-500/10',
          gradientTo: 'to-blue-500/5'
        };
    }
  };
  
  const rarityStyle = getRarityStyle();
  
  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 ${rarityStyle.borderColor} shadow-lg ${rarityStyle.glowColor} bg-gradient-to-b ${rarityStyle.gradientFrom} ${rarityStyle.gradientTo} bg-[hsl(var(--cwg-dark-blue))]`}
      onClick={onClick}
    >
      <div className="w-full aspect-square relative overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[hsl(var(--cwg-dark))]">
            <Skeleton className="w-full h-full" />
          </div>
        )}
        
        {imageError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[hsl(var(--cwg-dark))] p-4">
            <img 
              src={cwgGif} 
              alt="ClockWork Gamers" 
              className="h-32 w-32 object-contain mb-4" 
            />
            <p className="text-sm text-center text-[hsl(var(--cwg-muted))]">CWG Collection Preview</p>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={name}
            className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageLoaded(true);
              setImageError(true);
            }}
          />
        )}
        
        <div className="absolute top-2 right-2">
          <Badge className={`shadow-md ${rarityStyle.badgeColor}`}>
            {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
          </Badge>
        </div>
        
        {floorPrice !== undefined && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="outline" className="bg-[hsl(var(--cwg-dark))/80] text-white border-none">
              Floor: {floorPrice} ETH
            </Badge>
          </div>
        )}
      </div>
      
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl truncate neon-text-blue" title={name}>
              {name}
            </CardTitle>
            <CardDescription className="text-sm text-[hsl(var(--cwg-muted))]">
              CWG Collection
            </CardDescription>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-2">
                  <p className="font-semibold">Collection Benefits:</p>
                  <ul className="list-disc pl-4 text-sm space-y-1">
                    {benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-1 pb-2">
        <p className="text-sm text-[hsl(var(--cwg-muted))] line-clamp-2 h-10" title={description}>
          {description}
        </p>
        
        <div className="mt-3 space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[hsl(var(--cwg-muted))]">Supply: {mintedCount}/{totalSupply}</span>
              <span className="font-medium">{Math.round((mintedCount / totalSupply) * 100)}%</span>
            </div>
            <Progress value={progressValue} className="h-1.5" />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-[hsl(var(--cwg-muted))]" />
              <span className="text-xs">{ownerCount} owners</span>
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--cwg-blue))]" />
              <span className="text-xs text-[hsl(var(--cwg-blue))]">Guild NFT</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-2">
        {mintLink ? (
          <Button className="w-full" onClick={(e) => {
            e.stopPropagation();
            window.open(mintLink, '_blank');
          }}>
            Mint NFT
          </Button>
        ) : mintedCount < totalSupply ? (
          <Button className="w-full" disabled>
            Coming Soon
          </Button>
        ) : (
          <Button className="w-full" variant="outline" disabled>
            Sold Out
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}