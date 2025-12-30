import { useState, useEffect, type CSSProperties } from 'react';
import { Card } from '../types';

interface ObstacleOverlayProps {
  card: Card;
  isBreaking?: boolean;
}

export const ObstacleOverlay = ({ card, isBreaking = false }: ObstacleOverlayProps) => {
  const [isShatteringIce, setIsShatteringIce] = useState(false);
  const [isShatteringRock, setIsShatteringRock] = useState(false);
  const [isShatteringIron, setIsShatteringIron] = useState(false);
  const [previousHealth, setPreviousHealth] = useState(card.obstacleHealth);

  useEffect(() => {
    const prev = previousHealth ?? 0;
    const curr = card.obstacleHealth ?? 0;

    const wasDestroyed = prev > 0 && curr <= 0;

    if (wasDestroyed) {
      if (card.obstacle === 'ice') {
        setIsShatteringIce(true);
        setTimeout(() => setIsShatteringIce(false), 520);
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

  // Obstáculos con vida (ice/stone/iron)
  const hasHealthObstacle = !!card.obstacle && (card.obstacleHealth ?? 0) > 0;

  // Obstáculos “especiales” sin vida (fire/bomb/virus) o estados
  const hasSpecialObstacle =
    card.obstacle === 'fire' ||
    card.obstacle === 'bomb' ||
    card.obstacle === 'virus' ||
    card.isInfected ||
    card.isWildcard;

  // Si no hay nada que renderizar, fuera
  if (!hasHealthObstacle && !hasSpecialObstacle && !isShatteringIce && !isShatteringRock && !isShatteringIron) {
    return null;
  }

  /**
   * ICE
   */
  if (card.obstacle === 'ice' || isShatteringIce) {
    return (
      <div
        className="absolute inset-0 pointer-events-none z-[999]"
        style={{ transform: 'translateZ(2px)' }}
      >
        {/* Hielo visible solo si tiene vida */}
        {hasHealthObstacle && card.obstacle === 'ice' && (
          <div className={`absolute inset-0 rounded-xl ice-overlay ${isShatteringIce ? 'ice-breaking' : ''}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-200/80 via-sky-300/80 to-sky-400/80 backdrop-blur-sm border-2 border-cyan-100/80 rounded-xl" />

            <div className="absolute inset-0 rounded-xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent" />
              <div className="absolute top-1/4 left-0 w-1/3 h-1/3 bg-white/20 blur-xl rounded-full" />
            </div>

            <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full animate-ping opacity-60" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-5xl animate-pulse">❄️</div>
            </div>
          </div>
        )}

        {/* Partículas del hielo SOLO cuando se rompe */}
        {isShatteringIce && (
          <div className="absolute inset-0">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="ice-particle"
                style={
                  {
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateX(60px) scale(0.8)`,
                    animation: 'ice-pop 520ms ease-out forwards',
                  } as CSSProperties
                }
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  /**
   * STONE
   */
  if (card.obstacle === 'stone' || isShatteringRock) {
    const health = card.obstacleHealth ?? 0;

    return (
      <div
        className="absolute inset-0 pointer-events-none z-[999]"
        style={{ transform: 'translateZ(2px)' }}
      >
        {hasHealthObstacle && card.obstacle === 'stone' && (
          <div className={`absolute inset-0 rounded-xl ${isShatteringRock ? 'rock-breaking' : ''}`}>
            {health === 2 && (
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 50%, #4b5563 100%)',
                  boxShadow:
                    'inset 0 3px 10px rgba(255,255,255,0.4), inset 0 -6px 16px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.5)',
                  border: '4px solid #52525b',
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-5xl filter drop-shadow-lg">🪨</div>
                </div>
                <div className="absolute bottom-2 right-2 w-7 h-7 bg-gradient-to-br from-slate-500 to-slate-700 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-xl border-2 border-slate-300">
                  2
                </div>
              </div>
            )}

            {health === 1 && (
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 50%, #64748b 100%)',
                  boxShadow:
                    'inset 0 2px 8px rgba(255,255,255,0.5), inset 0 -4px 12px rgba(0,0,0,0.5), 0 6px 20px rgba(0,0,0,0.4)',
                  border: '4px solid #71717a',
                }}
              >
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

        {isShatteringRock && (
          <div className="absolute inset-0">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rock-particle"
                style={
                  {
                    left: '50%',
                    top: '50%',
                    '--angle': `${i * 72}deg`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  /**
   * IRON
   */
  if (card.obstacle === 'iron' || isShatteringIron) {
    const health = card.obstacleHealth ?? 0;

    return (
      <div className="absolute inset-0 pointer-events-none z-[999]" style={{ transform: 'translateZ(2px)' }}>
        {hasHealthObstacle && card.obstacle === 'iron' && (
          <div className={`absolute inset-0 rounded-xl ${isShatteringIron ? 'rock-breaking' : ''}`}>
            {health === 2 && (
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #b45309 0%, #92400e 50%, #78350f 100%)',
                  boxShadow:
                    'inset 0 3px 10px rgba(251,191,36,0.3), inset 0 -6px 16px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.6)',
                  border: '4px solid #854d0e',
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-5xl filter drop-shadow-lg">⛓️</div>
                </div>
                <div className="absolute bottom-2 right-2 w-7 h-7 bg-gradient-to-br from-orange-600 to-orange-900 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-xl border-2 border-amber-700">
                  2
                </div>
              </div>
            )}

            {health === 1 && (
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 50%, #92400e 100%)',
                  boxShadow:
                    'inset 0 2px 8px rgba(251,191,36,0.4), inset 0 -4px 12px rgba(0,0,0,0.6), 0 6px 20px rgba(0,0,0,0.5)',
                  border: '4px solid #a16207',
                }}
              >
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

        {isShatteringIron && (
          <div className="absolute inset-0">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rock-particle"
                style={
                  {
                    left: '50%',
                    top: '50%',
                    '--angle': `${i * 72}deg`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  /**
   * FIRE / BOMB / VIRUS
   */
  if (card.obstacle === 'fire') {
    return (
      <div className="absolute inset-0 pointer-events-none z-[999]">
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
      <div className="absolute inset-0 pointer-events-none z-[999]">
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
      <div className="absolute inset-0 pointer-events-none z-[999]">
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
