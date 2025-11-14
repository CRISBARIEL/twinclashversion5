import { useState, useEffect } from 'react';
import { Card } from '../types';

interface ObstacleOverlayProps {
  card: Card;
  isBreaking?: boolean;
}

/**
 * Lightweight obstacle overlay component
 *
 * ICE:
 * - Shows translucent blue crystal when health > 0
 * - Triggers breaking animation when health goes from >0 to 0
 * - Uses GPU-accelerated CSS transforms (scale + opacity only)
 * - Shows 5 small particles that fly outward
 *
 * ROCK (PAPER):
 * - Shows kraft paper texture when health > 0
 * - Two visual states: health=2 (solid) and health=1 (cracked)
 * - Breaking animation with paper pieces
 */
export const ObstacleOverlay = ({ card, isBreaking = false }: ObstacleOverlayProps) => {
  // Internal state to track breaking animation
  const [isShatteringIce, setIsShatteringIce] = useState(false);
  const [isShatteringRock, setIsShatteringRock] = useState(false);
  const [previousHealth, setPreviousHealth] = useState(card.obstacleHealth);

  /**
   * Detects when obstacle health changes from >0 to 0
   * Triggers breaking animation for 500-600ms
   * Then unmounts the overlay
   */
  useEffect(() => {
    const wasDestroyed = previousHealth !== undefined && previousHealth > 0 && (card.obstacleHealth ?? 0) <= 0;

    if (wasDestroyed) {
      if (card.obstacle === 'ice') {
        setIsShatteringIce(true);
        setTimeout(() => setIsShatteringIce(false), 500);
      } else if (card.obstacle === 'stone') {
        setIsShatteringRock(true);
        setTimeout(() => setIsShatteringRock(false), 600);
      }
    }

    setPreviousHealth(card.obstacleHealth);
  }, [card.obstacle, card.obstacleHealth, previousHealth]);

  const hasObstacle = card.obstacle && (card.obstacleHealth ?? 0) > 0;

  // Keep rendering during break animation, then unmount
  if (!hasObstacle && !isShatteringIce && !isShatteringRock) return null;

  /**
   * ICE OVERLAY
   * Performance: Uses only transform and opacity (GPU-accelerated)
   */
  if (card.obstacle === 'ice' || isShatteringIce) {
    return (
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Main ice crystal - only visible when health > 0 */}
        {hasObstacle && card.obstacle === 'ice' && (
          <div className={`absolute inset-0 rounded-xl ice-overlay ${isShatteringIce ? 'ice-breaking' : ''}`}>
            {/* Ice gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-200/80 via-sky-300/80 to-sky-400/80 backdrop-blur-sm border-2 border-cyan-100/80 rounded-xl" />

            {/* Light reflections */}
            <div className="absolute inset-0 rounded-xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent" />
              <div className="absolute top-1/4 left-0 w-1/3 h-1/3 bg-white/20 blur-xl rounded-full" />
            </div>

            {/* Sparkles */}
            <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full animate-ping opacity-60" />

            {/* Snowflake icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-5xl animate-pulse">❄️</div>
            </div>
          </div>
        )}

        {/* Ice particles - only during break animation */}
        {isShatteringIce && (
          <div className="absolute inset-0">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="ice-particle"
                style={{
                  left: '50%',
                  top: '50%',
                  '--angle': `${i * 72}deg`,
                } as React.CSSProperties}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  /**
   * ROCK OVERLAY (Hand-drawn stone style)
   */
  if (card.obstacle === 'stone' || isShatteringRock) {
    const health = card.obstacleHealth ?? 0;

    return (
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Stone overlay - only visible when health > 0 */}
        {hasObstacle && card.obstacle === 'stone' && (
          <div className={`absolute inset-0 rounded-xl ${isShatteringRock ? 'rock-breaking' : ''}`}>
            {/* Health = 2 (solid stone) */}
            {health === 2 && (
              <div className="absolute inset-0 rounded-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #78716c 0%, #57534e 30%, #44403c 70%, #292524 100%)',
                  boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.2), inset 0 -4px 12px rgba(0,0,0,0.5), 0 6px 20px rgba(0,0,0,0.5)',
                  border: '3px solid rgba(120, 113, 108, 0.6)',
                }}
              >
                {/* Hand-drawn texture lines */}
                <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M 10 20 Q 30 18 50 20 T 90 20" stroke="rgba(0,0,0,0.3)" strokeWidth="0.8" fill="none" />
                  <path d="M 5 35 Q 25 33 50 35 T 95 35" stroke="rgba(0,0,0,0.25)" strokeWidth="0.7" fill="none" />
                  <path d="M 8 50 Q 28 48 50 50 T 92 50" stroke="rgba(0,0,0,0.3)" strokeWidth="0.8" fill="none" />
                  <path d="M 12 65 Q 32 63 50 65 T 88 65" stroke="rgba(0,0,0,0.25)" strokeWidth="0.7" fill="none" />
                  <path d="M 7 80 Q 27 78 50 80 T 93 80" stroke="rgba(0,0,0,0.3)" strokeWidth="0.8" fill="none" />
                  <path d="M 25 10 Q 23 30 25 50 T 25 90" stroke="rgba(0,0,0,0.2)" strokeWidth="0.6" fill="none" />
                  <path d="M 50 5 Q 48 25 50 50 T 50 95" stroke="rgba(0,0,0,0.25)" strokeWidth="0.7" fill="none" />
                  <path d="M 75 8 Q 73 28 75 50 T 75 92" stroke="rgba(0,0,0,0.2)" strokeWidth="0.6" fill="none" />
                  <path d="M 30 30 L 35 40 L 32 48" stroke="rgba(0,0,0,0.4)" strokeWidth="1" fill="none" strokeLinecap="round" />
                  <path d="M 65 25 L 70 35 L 68 43" stroke="rgba(0,0,0,0.35)" strokeWidth="0.9" fill="none" strokeLinecap="round" />
                  <path d="M 45 60 L 50 70 L 48 78" stroke="rgba(0,0,0,0.4)" strokeWidth="1" fill="none" strokeLinecap="round" />
                  <circle cx="20" cy="25" r="1.5" fill="rgba(0,0,0,0.2)" />
                  <circle cx="40" cy="40" r="1.2" fill="rgba(0,0,0,0.15)" />
                  <circle cx="60" cy="30" r="1.3" fill="rgba(0,0,0,0.18)" />
                  <circle cx="75" cy="55" r="1.4" fill="rgba(0,0,0,0.2)" />
                  <circle cx="35" cy="70" r="1.1" fill="rgba(0,0,0,0.15)" />
                  <circle cx="80" cy="75" r="1.3" fill="rgba(0,0,0,0.17)" />
                </svg>
                <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <ellipse cx="25" cy="20" rx="8" ry="6" fill="rgba(255,255,255,0.25)" />
                  <ellipse cx="70" cy="35" rx="6" ry="5" fill="rgba(255,255,255,0.2)" />
                  <ellipse cx="40" cy="60" rx="7" ry="5" fill="rgba(255,255,255,0.15)" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-5xl filter drop-shadow-lg">🪨</div>
                </div>
                <div className="absolute bottom-2 right-2 w-7 h-7 bg-gradient-to-br from-stone-500 to-stone-700 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-xl border-2 border-stone-300">
                  2
                </div>
              </div>
            )}

            {/* Health = 1 (cracked stone) */}
            {health === 1 && (
              <div className="absolute inset-0 rounded-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #a8a29e 0%, #78716c 40%, #57534e 100%)',
                  boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.3), inset 0 -3px 10px rgba(0,0,0,0.4), 0 4px 15px rgba(0,0,0,0.4)',
                  border: '3px solid rgba(168, 162, 158, 0.5)',
                }}
              >
                <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M 10 25 Q 30 23 50 25 T 90 25" stroke="rgba(0,0,0,0.25)" strokeWidth="0.7" fill="none" />
                  <path d="M 8 50 Q 28 48 50 50 T 92 50" stroke="rgba(0,0,0,0.25)" strokeWidth="0.7" fill="none" />
                  <path d="M 12 75 Q 32 73 50 75 T 88 75" stroke="rgba(0,0,0,0.25)" strokeWidth="0.7" fill="none" />
                  <path d="M 30 10 Q 28 30 30 50 T 30 90" stroke="rgba(0,0,0,0.2)" strokeWidth="0.6" fill="none" />
                  <path d="M 70 10 Q 68 30 70 50 T 70 90" stroke="rgba(0,0,0,0.2)" strokeWidth="0.6" fill="none" />
                </svg>
                <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M 15 30 L 25 40 L 20 50 L 30 60 L 25 70 L 35 80" stroke="rgba(41, 37, 36, 0.7)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 60 20 L 70 35 L 65 45" stroke="rgba(41, 37, 36, 0.6)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  <path d="M 45 55 L 55 65 L 50 75" stroke="rgba(41, 37, 36, 0.5)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                  <path d="M 25 40 L 20 45" stroke="rgba(41, 37, 36, 0.5)" strokeWidth="1" fill="none" strokeLinecap="round" />
                  <path d="M 30 60 L 35 55" stroke="rgba(41, 37, 36, 0.5)" strokeWidth="1" fill="none" strokeLinecap="round" />
                  <path d="M 70 35 L 75 38" stroke="rgba(41, 37, 36, 0.4)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
                </svg>
                <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <ellipse cx="30" cy="25" rx="9" ry="7" fill="rgba(255,255,255,0.3)" />
                  <ellipse cx="65" cy="40" rx="7" ry="6" fill="rgba(255,255,255,0.25)" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-5xl opacity-75 filter drop-shadow-md">🪨</div>
                </div>
                <div className="absolute bottom-2 right-2 w-7 h-7 bg-gradient-to-br from-stone-400 to-stone-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 border-stone-200">
                  1
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rock particles - only during break animation */}
        {isShatteringRock && (
          <div className="absolute inset-0">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rock-particle"
                style={{
                  left: '50%',
                  top: '50%',
                  '--angle': `${i * 72}deg`,
                } as React.CSSProperties}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
};
