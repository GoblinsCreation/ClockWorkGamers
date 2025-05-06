import React, { useState } from 'react';
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { Check, Copy, Facebook, Linkedin, Mail, Twitter } from "lucide-react";
import { FaDiscord } from "react-icons/fa";

interface GuildShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildName?: string;
  guildDescription?: string;
  guildImage?: string;
}

export function GuildShareModal({
  open,
  onOpenChange,
  guildName = "ClockWork Gamers",
  guildDescription = "Join our Web3 gaming guild to connect with players, streamers, and creators!",
  guildImage = "/images/cwg-logo.png"
}: GuildShareModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [customMessage, setCustomMessage] = useState(
    `Check out ${guildName}! ${guildDescription} Join me on this amazing platform.`
  );
  
  const websiteUrl = window.location.origin;
  const shareUrl = `${websiteUrl}?ref=${encodeURIComponent(guildName.toLowerCase().replace(/\s+/g, '-'))}`;
  
  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "URL copied!",
        description: "Guild URL has been copied to your clipboard.",
      });
    });
  };
  
  // Share functions for different platforms
  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(customMessage)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
    
    toast({
      title: "Sharing to Twitter",
      description: "Opening Twitter to share your guild."
    });
  };
  
  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(customMessage)}`;
    window.open(facebookUrl, '_blank');
    
    toast({
      title: "Sharing to Facebook",
      description: "Opening Facebook to share your guild."
    });
  };
  
  const shareToLinkedin = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedinUrl, '_blank');
    
    toast({
      title: "Sharing to LinkedIn",
      description: "Opening LinkedIn to share your guild."
    });
  };
  
  const shareToDiscord = () => {
    // Discord doesn't have a direct share URL, so we'll copy a formatted message
    const discordMessage = `**${guildName}**\n${customMessage}\n${shareUrl}`;
    navigator.clipboard.writeText(discordMessage);
    
    toast({
      title: "Discord message copied!",
      description: "Paste in Discord to share with your friends.",
      action: (
        <ToastAction altText="Join our Discord">Join Discord</ToastAction>
      ),
    });
  };
  
  const shareByEmail = () => {
    const subject = `Join me on ${guildName}`;
    const body = `${customMessage}\n\n${shareUrl}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
    
    toast({
      title: "Sharing via Email",
      description: "Opening your email client."
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Guild</DialogTitle>
          <DialogDescription>
            Invite friends to join ClockWork Gamers
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="social" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="custom">Custom Message</TabsTrigger>
          </TabsList>
          
          <TabsContent value="social" className="py-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="justify-start gap-2 p-2 h-auto flex-col items-center"
                onClick={shareToTwitter}
              >
                <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                <span className="text-xs">Twitter</span>
              </Button>
              
              <Button
                variant="outline"
                className="justify-start gap-2 p-2 h-auto flex-col items-center"
                onClick={shareToFacebook}
              >
                <Facebook className="h-5 w-5 text-[#1877F2]" />
                <span className="text-xs">Facebook</span>
              </Button>
              
              <Button
                variant="outline"
                className="justify-start gap-2 p-2 h-auto flex-col items-center"
                onClick={shareToLinkedin}
              >
                <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                <span className="text-xs">LinkedIn</span>
              </Button>
              
              <Button
                variant="outline"
                className="justify-start gap-2 p-2 h-auto flex-col items-center"
                onClick={shareToDiscord}
              >
                <FaDiscord className="h-5 w-5 text-[#5865F2]" />
                <span className="text-xs">Discord</span>
              </Button>
              
              <Button
                variant="outline"
                className="justify-start gap-2 p-2 h-auto flex-col items-center"
                onClick={shareByEmail}
              >
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs">Email</span>
              </Button>
              
              <Button
                variant="outline"
                className="justify-start gap-2 p-2 h-auto flex-col items-center"
                onClick={handleCopy}
              >
                {copied ? 
                  <Check className="h-5 w-5 text-green-500" /> : 
                  <Copy className="h-5 w-5 text-muted-foreground" />
                }
                <span className="text-xs">{copied ? "Copied!" : "Copy Link"}</span>
              </Button>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center mb-2">
                <Label htmlFor="guild-url">Guild URL</Label>
              </div>
              <div className="flex space-x-2">
                <Input
                  id="guild-url"
                  value={shareUrl}
                  readOnly
                  className="flex-1"
                />
                <Button size="icon" onClick={handleCopy} variant="secondary">
                  {copied ? 
                    <Check className="h-4 w-4 text-green-500" /> : 
                    <Copy className="h-4 w-4" />
                  }
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="custom" className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="custom-message">Customize your message</Label>
              <Textarea
                id="custom-message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                This message will be included when sharing to social platforms.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="sm:justify-start">
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between w-full gap-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                Copy Link
              </Button>
              <Button onClick={shareToTwitter}>
                <Twitter className="h-4 w-4 mr-2" />
                Share Now
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}