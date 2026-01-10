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
  const [isShatteringIron, setIsShatteringIron] = useState(false);
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
      } else if (card.obstacle === 'iron') {
        setIsShatteringIron(true);
        setTimeout(() => setIsShatteringIron(false), 600);
      }
    }

    setPreviousHealth(card.obstacleHealth);
  }, [card.obstacle, card.obstacleHealth, previousHealth]);

  // For ice, stone, iron - check health
  // For fire, bomb, virus - always show when obstacle is present
  const hasObstacle = card.obstacle &&
    (card.obstacle === 'fire' || card.obstacle === 'bomb' || card.obstacle === 'virus' || (card.obstacleHealth ?? 0) > 0);

  // Keep rendering during break animation, then unmount
  if (!hasObstacle && !isShatteringIce && !isShatteringRock && !isShatteringIron) return null;

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
            {/* Health = 2 (solid stone - cartoon style) */}
            {health === 2 && (
              <div className="absolute inset-0 rounded-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 50%, #4b5563 100%)',
                  boxShadow: 'inset 0 3px 10px rgba(255,255,255,0.4), inset 0 -6px 16px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.5)',
                  border: '4px solid #52525b',
                }}
              >
                {/* Beveled edges (dark borders) */}
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-slate-600/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-slate-800/80 to-transparent" />
                  <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-slate-600/80 to-transparent" />
                  <div className="absolute top-0 bottom-0 right-0 w-3 bg-gradient-to-l from-slate-600/80 to-transparent" />
                </div>

                {/* Corner cracks (white lines like in the image) */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Top-left crack */}
                  <path d="M 8 8 L 15 12 L 12 18"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round" />
                  <path d="M 8 8 L 12 15 L 18 12"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round" />

                  {/* Top-right crack */}
                  <path d="M 92 8 L 85 12 L 88 18"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round" />
                  <path d="M 92 8 L 88 15 L 82 12"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round" />

                  {/* Bottom-left crack */}
                  <path d="M 8 92 L 15 88 L 12 82"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round" />
                  <path d="M 8 92 L 12 85 L 18 88"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round" />

                  {/* Bottom-right crack */}
                  <path d="M 92 92 L 85 88 L 88 82"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round" />
                  <path d="M 92 92 L 88 85 L 82 88"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round" />

                  {/* Small side cracks */}
                  <path d="M 35 5 L 38 10" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M 65 5 L 62 10" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M 5 35 L 10 38" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M 5 65 L 10 62" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>

                {/* Central highlight area */}
                <div className="absolute inset-8 bg-gradient-to-br from-slate-300/30 to-transparent rounded-lg" />

                {/* Dark spots for depth */}
                <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <ellipse cx="70" cy="65" rx="8" ry="6" fill="rgba(0,0,0,0.3)" />
                  <ellipse cx="30" cy="55" rx="6" ry="5" fill="rgba(0,0,0,0.25)" />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-5xl filter drop-shadow-lg">🪨</div>
                </div>
                <div className="absolute bottom-2 right-2 w-7 h-7 bg-gradient-to-br from-slate-500 to-slate-700 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-xl border-2 border-slate-300">
                  2
                </div>
              </div>
            )}

            {/* Health = 1 (damaged stone - cartoon style) */}
            {health === 1 && (
              <div className="absolute inset-0 rounded-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 50%, #64748b 100%)',
                  boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.5), inset 0 -4px 12px rgba(0,0,0,0.5), 0 6px 20px rgba(0,0,0,0.4)',
                  border: '4px solid #71717a',
                }}
              >
                {/* Beveled edges (lighter) */}
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-slate-400/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-slate-700/70 to-transparent" />
                  <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-slate-400/70 to-transparent" />
                  <div className="absolute top-0 bottom-0 right-0 w-3 bg-gradient-to-l from-slate-400/70 to-transparent" />
                </div>

                {/* Corner cracks (damaged - more prominent) */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Enhanced corner cracks */}
                  <path d="M 5 5 L 18 15 L 12 25"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round" />
                  <path d="M 5 5 L 15 18 L 25 12"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round" />

                  <path d="M 95 5 L 82 15 L 88 25"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round" />
                  <path d="M 95 5 L 85 18 L 75 12"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round" />

                  <path d="M 5 95 L 18 85 L 12 75"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round" />
                  <path d="M 5 95 L 15 82 L 25 88"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round" />

                  <path d="M 95 95 L 82 85 L 88 75"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round" />
                  <path d="M 95 95 L 85 82 L 75 88"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round" />

                  {/* Major center cracks */}
                  <path d="M 30 20 L 40 35 L 35 50"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round" />
                  <path d="M 70 30 L 60 45 L 65 60"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round" />
                  <path d="M 45 55 L 50 70 L 55 85"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round" />
                </svg>

                {/* Central highlight (lighter because damaged) */}
                <div className="absolute inset-10 bg-gradient-to-br from-slate-200/40 to-transparent rounded-lg" />

                {/* Dark spots */}
                <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <ellipse cx="65" cy="60" rx="7" ry="5" fill="rgba(0,0,0,0.25)" />
                  <ellipse cx="35" cy="50" rx="5" ry="4" fill="rgba(0,0,0,0.2)" />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-5xl opacity-80 filter drop-shadow-md">🪨</div>
                </div>
                <div className="absolute bottom-2 right-2 w-7 h-7 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 border-slate-200">
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

  /**
   * IRON OVERLAY (Rusted iron - oxidized metal)
   */
  if (card.obstacle === 'iron' || isShatteringIron) {
    const health = card.obstacleHealth ?? 0;

    return (
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Iron overlay - only visible when health > 0 */}
        {hasObstacle && card.obstacle === 'iron' && (
          <div className={`absolute inset-0 rounded-xl ${isShatteringIron ? 'rock-breaking' : ''}`}>
            {/* Health = 2 (solid rusty iron) */}
            {health === 2 && (
              <div className="absolute inset-0 rounded-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #b45309 0%, #92400e 50%, #78350f 100%)',
                  boxShadow: 'inset 0 3px 10px rgba(251,191,36,0.3), inset 0 -6px 16px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.6)',
                  border: '4px solid #854d0e',
                }}
              >
                {/* Rust texture spots */}
                <div className="absolute inset-0">
                  <div className="absolute top-2 left-3 w-4 h-4 bg-orange-800/60 rounded-full blur-sm" />
                  <div className="absolute top-5 right-4 w-3 h-3 bg-orange-900/50 rounded-full blur-sm" />
                  <div className="absolute bottom-3 left-5 w-5 h-5 bg-amber-900/50 rounded-full blur-sm" />
                  <div className="absolute bottom-6 right-3 w-3 h-3 bg-orange-800/60 rounded-full blur-sm" />
                </div>

                {/* Rust cracks */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M 10 10 L 20 18 L 15 28"
                    stroke="rgba(217,119,6,0.6)"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round" />
                  <path d="M 90 12 L 80 20 L 85 30"
                    stroke="rgba(217,119,6,0.6)"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round" />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-5xl filter drop-shadow-lg">⛓️</div>
                </div>
                <div className="absolute bottom-2 right-2 w-7 h-7 bg-gradient-to-br from-orange-600 to-orange-900 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-xl border-2 border-amber-700">
                  2
                </div>
              </div>
            )}

            {/* Health = 1 (heavily rusted iron) */}
            {health === 1 && (
              <div className="absolute inset-0 rounded-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 50%, #92400e 100%)',
                  boxShadow: 'inset 0 2px 8px rgba(251,191,36,0.4), inset 0 -4px 12px rgba(0,0,0,0.6), 0 6px 20px rgba(0,0,0,0.5)',
                  border: '4px solid #a16207',
                }}
              >
                {/* More rust spots */}
                <div className="absolute inset-0">
                  <div className="absolute top-1 left-2 w-6 h-6 bg-orange-700/70 rounded-full blur-md" />
                  <div className="absolute top-4 right-2 w-5 h-5 bg-orange-800/60 rounded-full blur-md" />
                  <div className="absolute bottom-2 left-4 w-7 h-7 bg-amber-800/60 rounded-full blur-md" />
                  <div className="absolute bottom-5 right-2 w-4 h-4 bg-orange-900/70 rounded-full blur-md" />
                  <div className="absolute top-1/2 left-1/3 w-5 h-5 bg-orange-800/50 rounded-full blur-md" />
                </div>

                {/* Heavy rust cracks */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M 8 8 L 22 20 L 18 35"
                    stroke="rgba(217,119,6,0.8)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round" />
                  <path d="M 92 10 L 78 22 L 82 37"
                    stroke="rgba(217,119,6,0.8)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round" />
                  <path d="M 10 90 L 24 78 L 20 63"
                    stroke="rgba(217,119,6,0.8)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round" />
                  <path d="M 90 88 L 76 76 L 80 61"
                    stroke="rgba(217,119,6,0.8)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round" />
                  <path d="M 40 25 L 50 40 L 45 55"
                    stroke="rgba(217,119,6,0.7)"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round" />
                  <path d="M 60 30 L 50 45 L 55 60"
                    stroke="rgba(217,119,6,0.7)"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round" />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-5xl opacity-80 filter drop-shadow-md">⛓️</div>
                </div>
                <div className="absolute bottom-2 right-2 w-7 h-7 bg-gradient-to-br from-orange-500 to-orange-800 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 border-amber-600">
                  1
                </div>
              </div>
            )}
          </div>
        )}

        {/* Iron particles - only during break animation */}
        {isShatteringIron && (
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

  if (card.obstacle === 'fire') {
    return (
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute inset-0 rounded-xl obstacle-fire overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-400/90 via-orange-500/90 to-yellow-500/90 backdrop-blur-sm border-2 border-red-300 rounded-xl" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-5xl animate-pulse">🔥</div>
          </div>
        </div>
      </div>
    );
  }

  if (card.obstacle === 'bomb') {
    return (
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute inset-0 rounded-xl obstacle-bomb overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-900/90 backdrop-blur-sm border-2 border-gray-600 rounded-xl" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-5xl">💣</div>
          </div>
        </div>
      </div>
    );
  }

  if (card.obstacle === 'virus') {
    return (
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute inset-0 rounded-xl obstacle-virus overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/90 via-emerald-500/90 to-teal-500/90 backdrop-blur-sm border-2 border-green-300 rounded-xl" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-5xl animate-pulse">🦠</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
