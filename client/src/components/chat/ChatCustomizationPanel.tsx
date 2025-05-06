import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Settings, Check, X } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';

export interface ChatCustomizationSettings {
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme: 'default' | 'minimal' | 'neon';
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  transparency: number;
  size: 'small' | 'medium' | 'large';
  fontStyle: 'default' | 'gaming' | 'futuristic' | 'minimalist';
  autoTranslate: boolean;
  showUserAvatars: boolean;
  showTimestamps: boolean;
}

const defaultSettings: ChatCustomizationSettings = {
  position: 'bottom-right',
  theme: 'default',
  soundEnabled: true,
  notificationsEnabled: true,
  transparency: 100,
  size: 'medium',
  fontStyle: 'default',
  autoTranslate: false,
  showUserAvatars: true,
  showTimestamps: true
};

interface ChatCustomizationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySettings: (settings: ChatCustomizationSettings) => void;
}

export function ChatCustomizationPanel({ 
  isOpen, 
  onClose,
  onApplySettings 
}: ChatCustomizationPanelProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useLocalStorage<ChatCustomizationSettings>(
    'cwg-chat-settings',
    defaultSettings
  );
  const [tempSettings, setTempSettings] = useState<ChatCustomizationSettings>(settings);

  useEffect(() => {
    if (isOpen) {
      setTempSettings(settings);
    }
  }, [isOpen, settings]);

  const handleApplySettings = () => {
    setSettings(tempSettings);
    onApplySettings(tempSettings);
    toast({
      title: "Chat settings updated",
      description: "Your customization preferences have been saved",
    });
    onClose();
  };

  const resetToDefaults = () => {
    setTempSettings(defaultSettings);
    toast({
      description: "Settings reset to defaults",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Chat Customization
          </DialogTitle>
          <DialogDescription>
            Personalize your chat experience with these options
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-2">
          {/* Position */}
          <div className="space-y-2">
            <Label>Chat Position</Label>
            <RadioGroup 
              value={tempSettings.position} 
              onValueChange={(val) => setTempSettings({
                ...tempSettings,
                position: val as ChatCustomizationSettings['position']
              })}
              className="flex flex-wrap gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bottom-right" id="bottom-right" />
                <Label htmlFor="bottom-right">Bottom Right</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bottom-left" id="bottom-left" />
                <Label htmlFor="bottom-left">Bottom Left</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="top-right" id="top-right" />
                <Label htmlFor="top-right">Top Right</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="top-left" id="top-left" />
                <Label htmlFor="top-left">Top Left</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select 
              value={tempSettings.theme}
              onValueChange={(val) => setTempSettings({
                ...tempSettings,
                theme: val as ChatCustomizationSettings['theme']
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="neon">Neon Glow</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Size */}
          <div className="space-y-2">
            <Label>Chat Size</Label>
            <Select 
              value={tempSettings.size}
              onValueChange={(val) => setTempSettings({
                ...tempSettings,
                size: val as ChatCustomizationSettings['size']
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Font Style */}
          <div className="space-y-2">
            <Label>Font Style</Label>
            <Select 
              value={tempSettings.fontStyle}
              onValueChange={(val) => setTempSettings({
                ...tempSettings,
                fontStyle: val as ChatCustomizationSettings['fontStyle']
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select font style" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="gaming">Gaming</SelectItem>
                  <SelectItem value="futuristic">Futuristic</SelectItem>
                  <SelectItem value="minimalist">Minimalist</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Transparency */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Background Opacity</Label>
              <span className="text-sm text-muted-foreground">{tempSettings.transparency}%</span>
            </div>
            <Slider
              value={[tempSettings.transparency]}
              min={50}
              max={100}
              step={5}
              onValueChange={(val) => setTempSettings({
                ...tempSettings,
                transparency: val[0]
              })}
            />
          </div>

          {/* Sound Enabled */}
          <div className="flex items-center justify-between">
            <Label htmlFor="sound-enabled">Sound Notifications</Label>
            <Switch 
              id="sound-enabled" 
              checked={tempSettings.soundEnabled}
              onCheckedChange={(checked) => setTempSettings({
                ...tempSettings,
                soundEnabled: checked
              })}
            />
          </div>

          {/* Notifications Enabled */}
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications-enabled">Message Notifications</Label>
            <Switch 
              id="notifications-enabled" 
              checked={tempSettings.notificationsEnabled}
              onCheckedChange={(checked) => setTempSettings({
                ...tempSettings,
                notificationsEnabled: checked
              })}
            />
          </div>

          {/* Auto Translate */}
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-translate">Auto-Translate Messages</Label>
            <Switch 
              id="auto-translate" 
              checked={tempSettings.autoTranslate}
              onCheckedChange={(checked) => setTempSettings({
                ...tempSettings,
                autoTranslate: checked
              })}
            />
          </div>

          {/* Show User Avatars */}
          <div className="flex items-center justify-between">
            <Label htmlFor="show-avatars">Show User Avatars</Label>
            <Switch 
              id="show-avatars" 
              checked={tempSettings.showUserAvatars}
              onCheckedChange={(checked) => setTempSettings({
                ...tempSettings,
                showUserAvatars: checked
              })}
            />
          </div>

          {/* Show Timestamps */}
          <div className="flex items-center justify-between">
            <Label htmlFor="show-timestamps">Show Message Timestamps</Label>
            <Switch 
              id="show-timestamps" 
              checked={tempSettings.showTimestamps}
              onCheckedChange={(checked) => setTempSettings({
                ...tempSettings,
                showTimestamps: checked
              })}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center mt-4">
          <div>
            <Button variant="outline" size="sm" onClick={resetToDefaults}>
              Reset to Defaults
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button onClick={handleApplySettings}>
              <Check className="h-4 w-4 mr-1" /> Apply
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}