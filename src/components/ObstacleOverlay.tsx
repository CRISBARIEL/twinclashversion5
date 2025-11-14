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
   * ROCK OVERLAY (Paper style)
   */
  if (card.obstacle === 'stone' || isShatteringRock) {
    const health = card.obstacleHealth ?? 0;

    return (
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Paper overlay - only visible when health > 0 */}
        {hasObstacle && card.obstacle === 'stone' && (
          <div className={`absolute inset-0 rounded-xl ${isShatteringRock ? 'rock-breaking' : ''}`}>
            {/* Health = 2 (solid paper) */}
            {health === 2 && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 shadow-lg">
                {/* Paper texture */}
                <div className="absolute inset-0 opacity-40 rounded-xl"
                  style={{
                    backgroundImage: `
                      radial-gradient(circle at 20% 20%, rgba(0,0,0,0.2) 0%, transparent 3%),
                      radial-gradient(circle at 80% 30%, rgba(255,255,255,0.15) 0%, transparent 4%),
                      radial-gradient(circle at 40% 60%, rgba(0,0,0,0.15) 0%, transparent 3%)
                    `
                  }}
                />
                {/* Wrinkles */}
                <div className="absolute inset-0 opacity-30 rounded-xl">
                  <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-black/40 to-transparent" />
                  <div className="absolute left-1/3 top-0 w-px h-full bg-gradient-to-b from-transparent via-black/30 to-transparent" />
                </div>
                {/* Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-5xl">📦</div>
                </div>
                {/* Health indicator */}
                <div className="absolute bottom-2 right-2 w-7 h-7 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-xl border-2 border-white">
                  2
                </div>
              </div>
            )}

            {/* Health = 1 (damaged paper) */}
            {health === 1 && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 shadow-md">
                {/* Lighter texture */}
                <div className="absolute inset-0 opacity-50 rounded-xl"
                  style={{
                    backgroundImage: `
                      radial-gradient(circle at 25% 25%, rgba(0,0,0,0.15) 0%, transparent 4%),
                      radial-gradient(circle at 75% 35%, rgba(255,255,255,0.2) 0%, transparent 5%)
                    `
                  }}
                />
                {/* Cracks */}
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <div className="absolute top-1/3 left-1/4 w-16 h-0.5 bg-amber-900/60 -rotate-12" />
                  <div className="absolute top-1/2 right-1/4 w-12 h-0.5 bg-amber-900/50 rotate-20" />
                </div>
                {/* Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-5xl opacity-70">📦</div>
                </div>
                {/* Health indicator */}
                <div className="absolute bottom-2 right-2 w-7 h-7 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 border-white">
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
