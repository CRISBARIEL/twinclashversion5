import { Card } from '../types';
import { getSkinById, getDefaultSkin, getEquippedTheme } from '../lib/skins';
import { playSoundFlip } from '../utils/soundManager';
import { useState, useEffect } from 'react';
import { ObstacleOverlay } from './ObstacleOverlay';

interface GameCardProps {
  card: Card;
  image: string;
  onClick: (id: number) => void;
  disabled: boolean;
  showHint?: boolean;
  isBreaking?: boolean;
}

export const GameCard = ({
  card,
  image,
  onClick,
  disabled,
  showHint = false,
  isBreaking = false,
}: GameCardProps) => {
  const [skin, setSkin] = useState(getDefaultSkin());

  useEffect(() => {
    const loadSkin = async () => {
      const themeId = await getEquippedTheme();
      const loadedSkin = getSkinById(themeId) || getDefaultSkin();
      setSkin(loadedSkin);
    };

    loadSkin();

    const handleThemeChange = () => loadSkin();
    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  const handleClick = () => {
    if (!disabled && !card.isFlipped && !card.isMatched && !card.bombCountdown) {
      playSoundFlip();
      onClick(card.id);
    }
  };

  const safeImage = typeof image === 'string' && image ? image : '';
  const isImageUrl = safeImage.length > 0 && (safeImage.startsWith('/') || safeImage.startsWith('http'));
  const isEmoji = safeImage.length > 0 && !isImageUrl;

  return (
    <div className="relative aspect-square cursor-pointer perspective-1000" onClick={handleClick}>
      <div
        className={`relative w-full h-full transition-transform duration-300 transform-style-3d ${
          card.isFlipped || card.isMatched ? 'rotate-y-180' : ''
        }`}
      >
        {/* Cara trasera */}
        <div className="absolute w-full h-full backface-hidden">
          {/* ✅ overflow-visible para no recortar partículas */}
          <div
            className={`w-full h-full ${skin.cardBackColor} rounded-xl shadow-lg flex items-center justify-center border-4 ${skin.cardBorderColor} relative overflow-visible ${
              showHint ? 'hint-pulse' : ''
            }`}
          >
            <div className="text-4xl text-white font-bold">?</div>
          </div>

          {/* ✅ Overlay AQUÍ (como antes) */}
          <ObstacleOverlay card={card} isBreaking={isBreaking} />
        </div>

        {/* Cara delantera */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180">
          <div className={`w-full h-full bg-white rounded-xl shadow-lg flex items-center justify-center border-4 ${skin.cardBorderColor} overflow-hidden`}>
            {safeImage === '' ? (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <div className="text-6xl text-gray-500 font-bold">?</div>
              </div>
            ) : isImageUrl ? (
              <img
                src={safeImage}
                alt="card"
                className="w-3/4 h-3/4 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) parent.innerHTML = '<div class="text-6xl text-gray-500 font-bold">?</div>';
                }}
              />
            ) : isEmoji ? (
              <div className="text-5xl sm:text-6xl md:text-7xl">{safeImage}</div>
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <div className="text-6xl text-gray-500 font-bold">?</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};



