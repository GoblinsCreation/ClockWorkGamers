import React, { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { GuildShareModal } from './GuildShareModal';
import { Share2 } from 'lucide-react';

interface ShareButtonProps extends ButtonProps {
  guildName?: string;
  guildDescription?: string;
  guildImage?: string;
  showIcon?: boolean;
  label?: string;
}

export function ShareButton({
  guildName,
  guildDescription,
  guildImage,
  showIcon = true,
  label = "Share",
  ...props
}: ShareButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <>
      <Button 
        onClick={() => setIsModalOpen(true)}
        {...props}
      >
        {showIcon && <Share2 className="h-4 w-4 mr-2" />}
        {label}
      </Button>
      
      <GuildShareModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        guildName={guildName}
        guildDescription={guildDescription}
        guildImage={guildImage}
      />
    </>
  );
}