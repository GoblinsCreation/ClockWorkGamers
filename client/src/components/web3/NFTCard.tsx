import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronsUpDown, Image as ImageIcon, Tag, Gamepad2, Zap } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface NFTCardProps {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  contractAddress: string;
  tokenId: string;
  collection: string;
  rarity: string;
  type?: string;
  game?: string;
  level?: number;
  power?: number;
  chain: string;
  onClick?: () => void;
}

export function NFTCard({
  id,
  name,
  description,
  imageUrl,
  contractAddress,
  tokenId,
  collection,
  rarity,
  type,
  game,
  level,
  power,
  chain,
  onClick
}: NFTCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Get the rarity color
  const getRarityColor = () => {
    switch(rarity.toLowerCase()) {
      case 'common': return 'bg-zinc-400 text-zinc-900';
      case 'uncommon': return 'bg-green-400 text-green-900';
      case 'rare': return 'bg-blue-400 text-blue-900';
      case 'epic': return 'bg-purple-400 text-purple-900';
      case 'legendary': return 'bg-amber-400 text-amber-900';
      default: return 'bg-zinc-400 text-zinc-900';
    }
  };
  
  // Get a chain specific style
  const getChainStyle = () => {
    switch(chain.toLowerCase()) {
      case 'ethereum': return 'bg-blue-700/10 border-blue-600/20 text-blue-500';
      case 'polygon': return 'bg-purple-700/10 border-purple-600/20 text-purple-500';
      case 'arbitrum': return 'bg-blue-500/10 border-blue-400/20 text-blue-400';
      default: return 'bg-zinc-700/10 border-zinc-600/20 text-zinc-500';
    }
  };

  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border ${getChainStyle()} bg-[hsl(var(--cwg-dark-blue))] cursor-pointer`}
      onClick={onClick}
    >
      <div className="w-full aspect-square relative overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[hsl(var(--cwg-dark-blue))]">
            <Skeleton className="w-full h-full" />
          </div>
        )}
        
        {imageError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[hsl(var(--cwg-dark-blue))] p-4">
            <ImageIcon className="h-16 w-16 text-[hsl(var(--cwg-muted))] mb-2" />
            <p className="text-sm text-center text-[hsl(var(--cwg-muted))]">Image not available</p>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={name}
            className={`w-full h-full object-cover transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageLoaded(true);
              setImageError(true);
            }}
          />
        )}
        
        <div className="absolute top-2 right-2">
          <Badge variant="outline" className={`${getRarityColor()} shadow-md`}>
            {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="p-3 pb-1">
        <CardTitle className="text-lg truncate neon-text-blue" title={name}>
          {name}
        </CardTitle>
        <CardDescription className="truncate text-xs text-[hsl(var(--cwg-muted))]">
          {collection}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-3 pt-0 pb-1">
        <p className="text-xs text-[hsl(var(--cwg-muted))] line-clamp-2 h-8" title={description}>
          {description}
        </p>
      </CardContent>
      
      <CardFooter className="p-3 pt-0 flex justify-between">
        <div className="flex space-x-1">
          {type && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 bg-[hsl(var(--cwg-dark))]">
                    <Tag className="h-3 w-3 mr-1" />
                    {type}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Type: {type}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {game && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 bg-[hsl(var(--cwg-dark))]">
                    <Gamepad2 className="h-3 w-3 mr-1" />
                    {game.length > 6 ? `${game.substring(0, 6)}...` : game}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Game: {game}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
          
        <div className="flex space-x-1">
          {level !== undefined && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 bg-[hsl(var(--cwg-dark))]">
                    <ChevronsUpDown className="h-3 w-3 mr-1" />
                    {level}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Level: {level}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {power !== undefined && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 bg-[hsl(var(--cwg-dark))]">
                    <Zap className="h-3 w-3 mr-1" />
                    {power}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Power: {power}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}