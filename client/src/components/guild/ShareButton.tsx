import React, { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { GuildShareModal } from './GuildShareModal';

// Default guild data
const DEFAULT_GUILD_DATA = {
  name: 'ClockWork Gamers',
  description: 'A Web3 gaming guild connecting players, streamers, and creators',
  memberCount: 350,
  websiteUrl: window.location.origin,
  imageUrl: '/images/cwg-logo.png'
};

interface ShareButtonProps extends ButtonProps {
  variant?: 'default' | 'secondary' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  label?: string;
  customGuildData?: {
    name?: string;
    description?: string;
    memberCount?: number;
    imageUrl?: string;
    websiteUrl?: string;
  };
}

export function ShareButton({
  variant = 'default',
  size = 'default',
  showIcon = true,
  label = 'Share Guild',
  customGuildData,
  className,
  ...props
}: ShareButtonProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Merge custom guild data with defaults
  const guildData = {
    ...DEFAULT_GUILD_DATA,
    ...(customGuildData || {})
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setShowShareModal(true)}
        {...props}
      >
        {showIcon && <Share2 className={`h-4 w-4 ${label ? 'mr-2' : ''}`} />}
        {label && <span>{label}</span>}
      </Button>

      <GuildShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        guildData={guildData}
      />
    </>
  );
}