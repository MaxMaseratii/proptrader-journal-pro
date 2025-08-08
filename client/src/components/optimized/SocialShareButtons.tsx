import { memo, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  Share2,
  TrendingUp,
  Trophy
} from "lucide-react";

interface ShareData {
  totalPnL: string;
  winRate: string;
  bestDay: string;
  currentStreak: number;
}

interface SocialShareButtonsProps {
  shareData: ShareData;
  className?: string;
}

// Optimized social media share component with error boundaries
export const SocialShareButtons = memo<SocialShareButtonsProps>(({ 
  shareData, 
  className = "" 
}) => {
  const [isSharing, setIsSharing] = useState(false);

  const generateShareText = useCallback((platform: string) => {
    const baseText = `🚀 Trading Update!\n📈 P&L: ${shareData.totalPnL}\n🎯 Win Rate: ${shareData.winRate}\n🔥 Current Streak: ${shareData.currentStreak} days\n\n#PropTrading #TradingJournal #PropTraderJournal`;
    
    const platformSpecific = {
      twitter: baseText + '\n\nTrack your trading with PropTrader Journal 📊',
      facebook: baseText + '\n\nUsing PropTrader Journal to stay disciplined and track performance!',
      instagram: '🚀 Another day crushing it in the markets! 📈\n\n' + baseText.replace(/\n/g, ' '),
      tiktok: '📈 Trading results speak for themselves! ' + baseText.split('\n')[0],
      youtube: baseText + '\n\nCheck out my trading journey!'
    };

    return platformSpecific[platform as keyof typeof platformSpecific] || baseText;
  }, [shareData]);

  const handleShare = useCallback(async (platform: string) => {
    if (isSharing) return;
    
    setIsSharing(true);
    
    try {
      const shareText = generateShareText(platform);
      const encodedText = encodeURIComponent(shareText);
      const urls = {
        twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodedText}`,
        instagram: `https://www.instagram.com/`, // Opens Instagram - user manually posts
        tiktok: `https://www.tiktok.com/`, // Opens TikTok - user manually posts
        youtube: `https://www.youtube.com/` // Opens YouTube - user manually posts
      };

      const url = urls[platform as keyof typeof urls];
      if (url) {
        window.open(url, '_blank', 'width=600,height=400');
      }
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setTimeout(() => setIsSharing(false), 1000);
    }
  }, [generateShareText, isSharing]);

  const shareButtons = [
    { 
      platform: 'facebook', 
      icon: Facebook, 
      label: 'Facebook',
      color: 'hover:bg-blue-600'
    },
    { 
      platform: 'instagram', 
      icon: Instagram, 
      label: 'Instagram',
      color: 'hover:bg-pink-600'
    },
    { 
      platform: 'twitter', 
      icon: Twitter, 
      label: 'X (Twitter)',
      color: 'hover:bg-black'
    },
    { 
      platform: 'tiktok', 
      icon: TrendingUp, 
      label: 'TikTok',
      color: 'hover:bg-red-600'
    },
    { 
      platform: 'youtube', 
      icon: Youtube, 
      label: 'YouTube',
      color: 'hover:bg-red-700'
    }
  ];

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2 w-full">
        <Share2 className="h-4 w-4" />
        <span>Share your trading progress:</span>
      </div>
      
      {shareButtons.map(({ platform, icon: Icon, label, color }) => (
        <Button
          key={platform}
          variant="outline"
          size="sm"
          onClick={() => handleShare(platform)}
          disabled={isSharing}
          className={`border-gray-600 text-gray-300 ${color} transition-colors duration-200`}
        >
          <Icon className="h-4 w-4 mr-1" />
          {label}
        </Button>
      ))}
    </div>
  );
});

SocialShareButtons.displayName = 'SocialShareButtons';