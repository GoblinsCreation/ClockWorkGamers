import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Share2, 
  Copy, 
  Check, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GuildShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  guildData: {
    name: string;
    description: string;
    memberCount: number;
    imageUrl?: string;
    websiteUrl: string;
  };
}

export function GuildShareModal({ 
  isOpen, 
  onClose,
  guildData 
}: GuildShareModalProps) {
  const [activeTab, setActiveTab] = useState('social');
  const [customMessage, setCustomMessage] = useState(`Join me on ${guildData.name} - a Web3 gaming guild with ${guildData.memberCount} members! #ClockWorkGamers #Web3Gaming`);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Format the base share URL
  const shareUrl = guildData.websiteUrl || window.location.origin;

  // Generate the various sharing URLs
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(customMessage)}&url=${encodeURIComponent(shareUrl)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(customMessage)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(customMessage)}`;
  const emailSubject = `Join ${guildData.name} Gaming Guild`;
  const emailBody = `${customMessage}\n\n${shareUrl}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  // Handle copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "You can now paste the text anywhere",
      });
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Could not copy text: ', err);
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually",
        variant: "destructive",
      });
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share CWG Guild
          </DialogTitle>
          <DialogDescription>
            Invite friends to join our Web3 gaming community
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="social" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="custom">Custom Message</TabsTrigger>
          </TabsList>
          
          <TabsContent value="social" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="flex items-center gap-2 h-auto py-3"
                onClick={() => window.open(twitterUrl, '_blank')}
              >
                <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                <span>Twitter / X</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center gap-2 h-auto py-3"
                onClick={() => window.open(facebookUrl, '_blank')}
              >
                <Facebook className="h-5 w-5 text-[#1877F2]" />
                <span>Facebook</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center gap-2 h-auto py-3"
                onClick={() => window.open(linkedinUrl, '_blank')}
              >
                <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                <span>LinkedIn</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center gap-2 h-auto py-3"
                onClick={() => window.open(emailUrl, '_blank')}
              >
                <Mail className="h-5 w-5 text-amber-500" />
                <span>Email</span>
              </Button>
            </div>
            
            <div className="pt-2">
              <Label htmlFor="copy-link" className="text-sm font-medium">
                Direct Link
              </Label>
              <div className="flex items-center mt-1.5 gap-2">
                <Input 
                  id="copy-link" 
                  value={shareUrl} 
                  readOnly 
                  className="flex-1"
                />
                <Button 
                  size="icon" 
                  variant="outline"
                  className="h-10 w-10 shrink-0"
                  onClick={() => copyToClipboard(shareUrl)}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="custom-message">Customize Your Message</Label>
              <Textarea
                id="custom-message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
                placeholder="Enter your custom invitation message"
              />
              <p className="text-xs text-muted-foreground">
                {280 - customMessage.length} characters remaining
              </p>
            </div>
            
            <div className="bg-muted/50 rounded-md p-3 text-sm">
              <h4 className="font-medium mb-1">Preview:</h4>
              <p className="text-muted-foreground">{customMessage}</p>
              <p className="text-primary text-xs mt-1">{shareUrl}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="default"
                className="flex items-center gap-2"
                onClick={() => window.open(twitterUrl, '_blank')}
              >
                <Twitter className="h-4 w-4" />
                <span>Share on Twitter</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => copyToClipboard(customMessage + '\n\n' + shareUrl)}
              >
                <Copy className="h-4 w-4" />
                <span>Copy Text</span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="sm:justify-start">
          <div className="w-full flex items-center justify-between gap-2 pt-2">
            <div className="text-xs text-muted-foreground">
              Share with your gaming community
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Done
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}