import { Card } from '../types';
import { getSkinById, getDefaultSkin, getEquippedTheme } from '../lib/skins';
import { playSoundFlip } from '../utils/soundManager';
import { useState, useEffect } from 'react';
// removed custom photo feature

interface GameCardProps {
  card: Card;
  image: string;
  onClick: (id: number) => void;
  disabled: boolean;
  showHint?: boolean;
}

export const GameCard = ({ card, image, onClick, disabled, showHint = false }: GameCardProps) => {
  const [skin, setSkin] = useState(getDefaultSkin());

  useEffect(() => {
    const loadSkin = async () => {
      const themeId = await getEquippedTheme();
      const loadedSkin = getSkinById(themeId) || getDefaultSkin();
      setSkin(loadedSkin);
    };

    loadSkin();

    const handleThemeChange = () => {
      loadSkin();
    };

    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  const handleClick = () => {
    if (!disabled && !card.isFlipped && !card.isMatched) {
      playSoundFlip();
      onClick(card.id);
    }
  };

  const hasObstacle = card.obstacle && (card.obstacleHealth ?? 0) > 0;
  const obstacleClass = card.obstacle === 'ice' ? 'obstacle-ice' : card.obstacle === 'stone' ? 'obstacle-stone' : '';

  return (
    <div
      className="relative aspect-square cursor-pointer perspective-1000"
      onClick={handleClick}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
          card.isFlipped || card.isMatched ? 'rotate-y-180' : ''
        }`}
      >
        <div className="absolute w-full h-full backface-hidden">
          <div className={`w-full h-full ${hasObstacle ? obstacleClass : skin.cardBackColor} rounded-xl shadow-lg flex items-center justify-center border-4 ${skin.cardBorderColor} relative overflow-hidden ${showHint ? 'hint-pulse' : ''}`}>
            {hasObstacle ? (
              <>
                <div className="absolute inset-2 border-2 border-white/30 rounded-lg"></div>
                <div className="text-4xl text-white/40 font-bold drop-shadow-lg z-10">?</div>
                {card.obstacle === 'stone' && card.obstacleHealth === 2 && (
                  <div className="absolute bottom-2 right-2 w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 border-white z-20">2</div>
                )}
                {card.obstacle === 'stone' && card.obstacleHealth === 1 && (
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/20 to-black/40 rounded-xl"></div>
                )}
              </>
            ) : (
              <>
                <div className="text-4xl text-white font-bold">?</div>
              </>
            )}
          </div>
        </div>

        <div className="absolute w-full h-full backface-hidden rotate-y-180">
          <div className={`w-full h-full bg-white rounded-xl shadow-lg flex items-center justify-center border-4 ${skin.cardBorderColor} overflow-hidden`}>
            <div className="text-6xl">{image}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
