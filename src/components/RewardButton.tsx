import { useState, useEffect } from 'react';
import { Gift, X } from 'lucide-react';

interface RewardButtonProps {
  currentLevel: number;
}

export function RewardButton({ currentLevel }: RewardButtonProps) {
  const [isClosedThisLevel, setIsClosedThisLevel] = useState(false);

  useEffect(() => {
    setIsClosedThisLevel(false);
  }, [currentLevel]);

  const handleClose = () => {
    setIsClosedThisLevel(true);
  };

  const handleClick = () => {
    if (typeof window.showRewardedAd === 'function') {
      window.showRewardedAd();
    } else {
      console.error('[RewardButton] showRewardedAd is not available');
    }
  };

  if (currentLevel < 5 || isClosedThisLevel) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="relative bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-full shadow-2xl p-1">
        <button
          onClick={handleClick}
          className="flex items-center gap-2 bg-white text-gray-900 font-bold px-4 py-3 rounded-full hover:scale-105 transition-transform duration-200 shadow-lg"
        >
          <Gift className="w-5 h-5 text-yellow-600" />
          <span className="text-sm whitespace-nowrap">+2.000 monedas</span>
        </button>

        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
