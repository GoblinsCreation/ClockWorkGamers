import React, { useState } from 'react';
import { Share, Users, Twitter, Facebook, Linkedin, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { MemberLeaderboard } from '@/components/leaderboard/MemberLeaderboard';
import { motion, AnimatePresence } from 'framer-motion';

// Share Modal Component
function GuildShareModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [message, setMessage] = useState('Join ClockWork Gamers - the premier Web3 gaming guild! Earn rewards, join tournaments, and connect with like-minded gamers. #ClockWorkGamers #Web3Gaming');

  const shareOptions = [
    { 
      name: 'Twitter', 
      icon: <Twitter className="h-5 w-5" />, 
      bgColor: 'bg-[#1DA1F2] hover:bg-[#1a94e0]',
      action: () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`, '_blank');
      }
    },
    { 
      name: 'Facebook', 
      icon: <Facebook className="h-5 w-5" />, 
      bgColor: 'bg-[#1877F2] hover:bg-[#166fe5]',
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=https://clockworkgamers.net&quote=${encodeURIComponent(message)}`, '_blank');
      }
    },
    { 
      name: 'LinkedIn', 
      icon: <Linkedin className="h-5 w-5" />, 
      bgColor: 'bg-[#0A66C2] hover:bg-[#0959ab]',
      action: () => {
        window.open(`https://www.linkedin.com/shareArticle?mini=true&url=https://clockworkgamers.net&title=Join%20ClockWork%20Gamers&summary=${encodeURIComponent(message)}`, '_blank');
      }
    },
    { 
      name: 'Copy Link', 
      icon: <LinkIcon className="h-5 w-5" />, 
      bgColor: 'bg-gray-700 hover:bg-gray-600',
      action: () => {
        navigator.clipboard.writeText(`https://clockworkgamers.net - ${message}`);
        alert('Guild invitation link copied to clipboard!');
      }
    }
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message);
    alert('Message copied to clipboard!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[hsl(var(--cwg-dark))] border border-[hsl(var(--cwg-dark-blue))] rounded-lg w-full max-w-md p-6 shadow-xl"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-orbitron font-semibold text-[hsl(var(--cwg-orange))]">
            Share Guild
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-[hsl(var(--cwg-muted))]"
          >
            ✕
          </Button>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Customize your message:</label>
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-32 p-3 bg-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))] rounded-md border border-[hsl(var(--cwg-border))] focus:border-[hsl(var(--cwg-blue))] focus:ring-1 focus:ring-[hsl(var(--cwg-blue))] outline-none resize-none"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="absolute bottom-2 right-2 text-xs text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-blue))]"
            >
              Copy
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {shareOptions.map((option) => (
            <Button
              key={option.name}
              className={`${option.bgColor} text-white font-medium flex items-center justify-center gap-2`}
              onClick={option.action}
            >
              {option.icon}
              {option.name}
            </Button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function ShowcasePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('features');
  const [showShareModal, setShowShareModal] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8 max-w-screen-xl">
      <AnimatePresence>
        {showShareModal && (
          <GuildShareModal 
            isOpen={showShareModal} 
            onClose={() => setShowShareModal(false)} 
          />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-orbitron font-bold text-[hsl(var(--cwg-orange))] mb-2">
            CWG Features Showcase
          </h1>
          <p className="text-[hsl(var(--cwg-muted))]">
            Explore our latest guild features and functionality
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))] hover:bg-[hsl(var(--cwg-blue))/10]"
            onClick={() => setShowShareModal(true)}
          >
            <Share className="h-4 w-4 mr-2" />
            Share Guild
          </Button>
          <Button
            className="bg-[hsl(var(--cwg-orange))] hover:bg-[hsl(var(--cwg-orange))/90] text-white"
          >
            <Users className="h-4 w-4 mr-2" />
            Join Guild
          </Button>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="border-b border-[hsl(var(--cwg-dark-blue))] mb-8 bg-transparent">
          <TabsTrigger 
            value="features" 
            className={`px-4 py-2 font-orbitron text-base ${activeTab === 'features' ? 'text-[hsl(var(--cwg-orange))] border-b-2 border-[hsl(var(--cwg-orange))]' : 'text-[hsl(var(--cwg-muted))]'}`}
          >
            Features Showcase
          </TabsTrigger>
          <TabsTrigger 
            value="leaderboard" 
            className={`px-4 py-2 font-orbitron text-base ${activeTab === 'leaderboard' ? 'text-[hsl(var(--cwg-orange))] border-b-2 border-[hsl(var(--cwg-orange))]' : 'text-[hsl(var(--cwg-muted))]'}`}
          >
            Guild Leaderboard
          </TabsTrigger>
          <TabsTrigger 
            value="sharing" 
            className={`px-4 py-2 font-orbitron text-base ${activeTab === 'sharing' ? 'text-[hsl(var(--cwg-orange))] border-b-2 border-[hsl(var(--cwg-orange))]' : 'text-[hsl(var(--cwg-muted))]'}`}
          >
            Social Sharing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="mt-0">
          <Card className="border-[hsl(var(--cwg-dark-blue))] bg-[hsl(var(--cwg-dark))]">
            <CardContent className="p-6">
              <h2 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-blue))] mb-4">
                ClockWork Gamers Features
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-[hsl(var(--cwg-dark-blue))] rounded-lg p-5 border border-[hsl(var(--cwg-border))]">
                  <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-orange))] mb-3">Web3 Integration</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-[hsl(var(--cwg-orange))] mr-2">✓</span>
                      <span>Wallet connection & authentication</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[hsl(var(--cwg-orange))] mr-2">✓</span>
                      <span>NFT marketplace integration</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[hsl(var(--cwg-orange))] mr-2">✓</span>
                      <span>Guild token ecosystem</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[hsl(var(--cwg-orange))] mr-2">✓</span>
                      <span>Play-to-earn gaming support</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-[hsl(var(--cwg-dark-blue))] rounded-lg p-5 border border-[hsl(var(--cwg-border))]">
                  <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-orange))] mb-3">Community Features</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-[hsl(var(--cwg-orange))] mr-2">✓</span>
                      <span>Real-time chat with auto-translation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[hsl(var(--cwg-orange))] mr-2">✓</span>
                      <span>Guild achievements system</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[hsl(var(--cwg-orange))] mr-2">✓</span>
                      <span>Member leaderboards</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[hsl(var(--cwg-orange))] mr-2">✓</span>
                      <span>Streamer integration</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-[hsl(var(--cwg-dark-blue))] rounded-lg p-5 border border-[hsl(var(--cwg-border))]">
                  <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-orange))] mb-3">Guild Tools</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-[hsl(var(--cwg-orange))] mr-2">✓</span>
                      <span>NFT & in-game item rentals</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[hsl(var(--cwg-orange))] mr-2">✓</span>
                      <span>Gaming courses & tutorials</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[hsl(var(--cwg-orange))] mr-2">✓</span>
                      <span>Play-to-earn calculators</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[hsl(var(--cwg-orange))] mr-2">✓</span>
                      <span>Referral program with rewards</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-0">
          <MemberLeaderboard />
        </TabsContent>

        <TabsContent value="sharing" className="mt-0">
          <Card className="border-[hsl(var(--cwg-dark-blue))] bg-[hsl(var(--cwg-dark))]">
            <CardContent className="p-6">
              <h2 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-blue))] mb-4">
                Guild Social Sharing
              </h2>
              <p className="text-[hsl(var(--cwg-muted))] mb-6">
                Promote your guild across social platforms
              </p>

              <div className="prose prose-invert max-w-none mb-8">
                <p>Our social sharing tools make it easy to promote your guild and invite new members across multiple platforms. You can customize your message and share directly to Twitter, Facebook, LinkedIn, or via email.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-orange))] mb-4">
                    Share Features
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-[hsl(var(--cwg-orange))] mr-2">•</span>
                      <span>Multiple social platform support</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[hsl(var(--cwg-orange))] mr-2">•</span>
                      <span>Customizable share messages</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[hsl(var(--cwg-orange))] mr-2">•</span>
                      <span>Direct sharing links</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[hsl(var(--cwg-orange))] mr-2">•</span>
                      <span>Copy to clipboard functionality</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[hsl(var(--cwg-orange))] mr-2">•</span>
                      <span>Guild stats and information included</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-orange))] mb-4">
                    Try it now
                  </h3>
                  <div className="bg-[hsl(var(--cwg-dark-blue))] rounded-lg p-6 border border-[hsl(var(--cwg-border))]">
                    <Button
                      className="w-full bg-[hsl(var(--cwg-orange))] hover:bg-[hsl(var(--cwg-orange))/90] text-white"
                      onClick={() => setShowShareModal(true)}
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <p className="text-sm text-[hsl(var(--cwg-muted))] mt-4">
                      Click the button above to open the share dialog and test the functionality.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 space-y-8">
                <div>
                  <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-blue))] mb-4">
                    Achievement Sharing
                  </h3>
                  <div className="bg-[hsl(var(--cwg-dark-blue))] rounded-lg p-6 border border-[hsl(var(--cwg-border))]">
                    <p className="mb-4">
                      In addition to guild sharing, users can share individual achievements on social media. When you earn badges or complete guild achievements, you can share them with friends.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        className="border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))] hover:bg-[hsl(var(--cwg-blue))/10]"
                      >
                        Share Achievement
                      </Button>
                      <Button
                        variant="secondary"
                      >
                        View Achievements
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-blue))] mb-4">
                    Referral Program
                  </h3>
                  <div className="bg-[hsl(var(--cwg-dark-blue))] rounded-lg p-6 border border-[hsl(var(--cwg-border))]">
                    <p className="mb-4">
                      Our referral program allows you to earn points and exclusive rewards by inviting friends to join ClockWork Gamers. Each successful referral increases your ranking on the leaderboard.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        className="border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))] hover:bg-[hsl(var(--cwg-blue))/10]"
                      >
                        My Referral Link
                      </Button>
                      <Button
                        variant="secondary"
                      >
                        Referral Stats
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}