import { Card } from '../types';
import { getSkinById, getDefaultSkin, getEquippedTheme } from '../lib/skins';
import { playSoundFlip } from '../utils/soundManager';
import { useState, useEffect } from 'react';
import { ObstacleOverlay } from './ObstacleOverlay';
// removed custom photo feature

interface GameCardProps {
  card: Card;
  image: string;
  onClick: (id: number) => void;
  disabled: boolean;
  showHint?: boolean;
  isBreaking?: boolean;
}

export const GameCard = ({ card, image, onClick, disabled, showHint = false, isBreaking = false }: GameCardProps) => {
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

  return (
    <div
      className="relative aspect-square cursor-pointer perspective-1000"
      onClick={handleClick}
    >
      <div
        className={`relative w-full h-full transition-transform duration-300 transform-style-3d ${
          card.isFlipped || card.isMatched ? 'rotate-y-180' : ''
        }`}
      >
        {/* Cara trasera de la carta (sin voltear) */}
        <div className="absolute w-full h-full backface-hidden">
          <div className={`w-full h-full ${skin.cardBackColor} rounded-xl shadow-lg flex items-center justify-center border-4 ${skin.cardBorderColor} relative overflow-hidden ${showHint ? 'hint-pulse' : ''}`}>
            <div className="text-4xl text-white font-bold">?</div>
          </div>

          {/* Overlay de obstáculo (hielo o piedra) renderizado encima de la carta */}
          <ObstacleOverlay card={card} isBreaking={isBreaking} />
        </div>

        <div className="absolute w-full h-full backface-hidden rotate-y-180">
          <div className={`w-full h-full bg-white rounded-xl shadow-lg flex items-center justify-center border-4 ${skin.cardBorderColor} overflow-hidden`}>
            {image.startsWith('/') || image.startsWith('http') ? (
              <img src={image} alt="card" className="w-3/4 h-3/4 object-contain" />
            ) : (
              <div className="text-5xl sm:text-6xl md:text-7xl">{image}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
