import { useState, useEffect } from 'react';
import { Card } from '../types';

interface ObstacleOverlayProps {
  card: Card;
  isBreaking?: boolean;
}

/**
 * CONFIGURACIÓN DE PARTÍCULAS
 * Sistema de explosión de partículas estilo Candy Crush
 */

// Partículas de hielo (cristales que explotan)
const ICE_PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  angle: (i * 360) / 12,
  distance: 60 + Math.random() * 20,
  size: 8 + Math.random() * 6,
  duration: 400 + Math.random() * 200,
  delay: Math.random() * 100,
}));

// Partículas de roca (trozos de papel/cartón arrugado)
const ROCK_PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  angle: (i * 360) / 10,
  distance: 50 + Math.random() * 25,
  size: 10 + Math.random() * 8,
  duration: 500 + Math.random() * 200,
  delay: Math.random() * 80,
}));

/**
 * Componente de overlay de obstáculos con efectos tipo Candy Crush
 *
 * HIELO:
 * - Cristal translúcido brillante con reflejos
 * - Explosión de cristales al romperse
 *
 * ROCA (PAPEL ARRUGADO):
 * - Textura tipo papel kraft/cartón arrugado
 * - Colores cálidos y naturales
 * - Explosión de trozos al romperse
 */
export const ObstacleOverlay = ({ card, isBreaking = false }: ObstacleOverlayProps) => {
  const [isShatteringIce, setIsShatteringIce] = useState(false);
  const [isShatteringRock, setIsShatteringRock] = useState(false);
  const [previousHealth, setPreviousHealth] = useState(card.obstacleHealth);

  /**
   * Detecta cuando un obstáculo se rompe completamente
   */
  useEffect(() => {
    const wasDestroyed = previousHealth !== undefined && previousHealth > 0 && (card.obstacleHealth ?? 0) <= 0;

    if (wasDestroyed) {
      if (card.obstacle === 'ice') {
        setIsShatteringIce(true);
        setTimeout(() => setIsShatteringIce(false), 600);
      } else if (card.obstacle === 'stone') {
        setIsShatteringRock(true);
        setTimeout(() => setIsShatteringRock(false), 700);
      }
    }

    setPreviousHealth(card.obstacleHealth);
  }, [card.obstacle, card.obstacleHealth, previousHealth]);

  const hasObstacle = card.obstacle && (card.obstacleHealth ?? 0) > 0;

  // Seguir renderizando durante la animación de rotura
  if (!hasObstacle && !isShatteringIce && !isShatteringRock) return null;

  /**
   * ==========================================
   * OVERLAY DE HIELO - Estilo Candy Crush
   * ==========================================
   *
   * Diseño: Cristal azul brillante con reflejos y brillos
   * Rotura: Explosión de cristales en todas direcciones
   */
  if (card.obstacle === 'ice' || isShatteringIce) {
    return (
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* CRISTAL DE HIELO - Solo visible si aún tiene vida */}
        {hasObstacle && card.obstacle === 'ice' && (
          <div
            className={`absolute inset-0 rounded-xl transition-all ${
              isBreaking || isShatteringIce
                ? 'duration-300 opacity-0 scale-125 blur-sm'
                : 'duration-200 opacity-100 scale-100'
            }`}
            style={{
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.85) 0%, rgba(14, 165, 233, 0.9) 50%, rgba(6, 182, 212, 0.85) 100%)',
              boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.5), inset 0 -5px 15px rgba(0, 0, 0, 0.2), 0 4px 15px rgba(56, 189, 248, 0.4)',
              border: '2px solid rgba(255, 255, 255, 0.6)',
            }}
          >
            {/* Reflejos brillantes dinámicos */}
            <div className="absolute inset-0 overflow-hidden rounded-xl">
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent"></div>
              <div className="absolute top-1/4 left-0 w-1/3 h-1/3 bg-white/20 blur-xl rounded-full"></div>
              <div className="absolute bottom-1/4 right-0 w-1/2 h-1/2 bg-cyan-400/30 blur-2xl rounded-full"></div>
            </div>

            {/* Brillos animados tipo Candy Crush */}
            <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full animate-ping"></div>
            <div className="absolute bottom-3 left-3 w-2 h-2 bg-cyan-100 rounded-full animate-pulse"></div>

            {/* Copo de nieve con efecto de brillo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="text-5xl animate-pulse filter drop-shadow-lg">❄️</div>
                <div className="absolute inset-0 bg-white/20 blur-xl rounded-full"></div>
              </div>
            </div>
          </div>
        )}

        {/* EXPLOSIÓN DE CRISTALES */}
        {isShatteringIce && (
          <div className="absolute inset-0 overflow-visible">
            {ICE_PARTICLES.map((particle, i) => {
              const radian = (particle.angle * Math.PI) / 180;
              const tx = Math.cos(radian) * particle.distance;
              const ty = Math.sin(radian) * particle.distance;

              return (
                <div
                  key={i}
                  className="absolute rounded-sm"
                  style={{
                    left: '50%',
                    top: '50%',
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    background: i % 3 === 0
                      ? 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)'
                      : i % 3 === 1
                      ? 'linear-gradient(135deg, #bae6fd 0%, #7dd3fc 100%)'
                      : 'linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%)',
                    boxShadow: '0 0 8px rgba(56, 189, 248, 0.6), inset 0 0 4px rgba(255, 255, 255, 0.8)',
                    transform: isShatteringIce
                      ? `translate(${tx}px, ${ty}px) rotate(${particle.angle * 2}deg) scale(0)`
                      : 'translate(-50%, -50%) rotate(0deg) scale(1)',
                    opacity: isShatteringIce ? 0 : 1,
                    transition: `all ${particle.duration}ms ease-out ${particle.delay}ms`,
                  }}
                />
              );
            })}

            {/* Chispas brillantes adicionales */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`spark-${i}`}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  boxShadow: '0 0 6px #ffffff',
                  transform: isShatteringIce
                    ? `translate(${Math.cos((i * 45 * Math.PI) / 180) * 80}px, ${Math.sin((i * 45 * Math.PI) / 180) * 80}px) scale(0)`
                    : 'translate(-50%, -50%) scale(1)',
                  opacity: isShatteringIce ? 0 : 0.9,
                  transition: `all 350ms ease-out ${i * 30}ms`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  /**
   * ==========================================
   * OVERLAY DE ROCA - Estilo Papel Arrugado
   * ==========================================
   *
   * Diseño: Papel kraft/cartón arrugado con textura natural
   * Colores: Tonos cálidos (marrón, beige, crema)
   * Rotura: Explosión de trozos de papel
   */
  if (card.obstacle === 'stone' || isShatteringRock) {
    const health = card.obstacleHealth ?? 0;

    return (
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* PAPEL ARRUGADO - Solo visible si aún tiene vida */}
        {hasObstacle && card.obstacle === 'stone' && (
          <div
            className={`absolute inset-0 rounded-xl transition-all ${
              isBreaking || isShatteringRock
                ? 'duration-400 opacity-0 scale-110'
                : 'duration-200 opacity-100 scale-100'
            }`}
          >
            {/* Estado según la salud */}
            {health === 2 && (
              // PAPEL ARRUGADO COMPLETO (2 vidas)
              <div
                className="absolute inset-0 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #d4a574 0%, #b8956a 30%, #9e7e5a 70%, #8b6f47 100%)',
                  boxShadow: 'inset 0 0 25px rgba(0, 0, 0, 0.3), inset 3px 3px 10px rgba(255, 255, 255, 0.15), 0 4px 15px rgba(0, 0, 0, 0.4)',
                }}
              >
                {/* Textura de papel arrugado */}
                <div
                  className="absolute inset-0 opacity-50 rounded-xl"
                  style={{
                    backgroundImage: `
                      radial-gradient(circle at 20% 20%, rgba(0, 0, 0, 0.2) 0%, transparent 3%),
                      radial-gradient(circle at 80% 30%, rgba(255, 255, 255, 0.15) 0%, transparent 4%),
                      radial-gradient(circle at 40% 60%, rgba(0, 0, 0, 0.15) 0%, transparent 3%),
                      radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 5%),
                      radial-gradient(circle at 15% 80%, rgba(0, 0, 0, 0.2) 0%, transparent 3%),
                      radial-gradient(circle at 90% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 4%)
                    `,
                  }}
                />

                {/* Arrugas y pliegues */}
                <div className="absolute inset-0 opacity-40 rounded-xl">
                  <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-black/40 to-transparent"></div>
                  <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-black/30 to-transparent"></div>
                  <div className="absolute left-1/3 top-0 w-px h-full bg-gradient-to-b from-transparent via-black/30 to-transparent"></div>
                  <div className="absolute left-2/3 top-0 w-px h-full bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                </div>

                {/* Icono central */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-5xl filter drop-shadow-lg">📦</div>
                </div>

                {/* Indicador de vida */}
                <div className="absolute bottom-2 right-2 w-7 h-7 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-xl border-2 border-white">
                  2
                </div>
              </div>
            )}

            {health === 1 && (
              // PAPEL ARRUGADO DAÑADO (1 vida)
              <div
                className="absolute inset-0 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #e8c9a1 0%, #d4a574 40%, #c19968 100%)',
                  boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.3)',
                }}
              >
                {/* Textura más clara (desgastada) */}
                <div
                  className="absolute inset-0 opacity-60 rounded-xl"
                  style={{
                    backgroundImage: `
                      radial-gradient(circle at 25% 25%, rgba(0, 0, 0, 0.15) 0%, transparent 4%),
                      radial-gradient(circle at 75% 35%, rgba(255, 255, 255, 0.2) 0%, transparent 5%),
                      radial-gradient(circle at 50% 70%, rgba(0, 0, 0, 0.1) 0%, transparent 6%)
                    `,
                  }}
                />

                {/* Roturas y grietas visibles */}
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <div className="absolute top-1/3 left-1/4 w-16 h-0.5 bg-amber-900/60 transform -rotate-12"></div>
                  <div className="absolute top-1/2 right-1/4 w-12 h-0.5 bg-amber-900/50 transform rotate-20"></div>
                  <div className="absolute bottom-1/3 left-1/3 w-20 h-px bg-amber-800/40 transform rotate-6"></div>

                  {/* Rasgaduras */}
                  <svg className="absolute top-1/4 right-1/3 w-8 h-8 opacity-30" viewBox="0 0 32 32">
                    <path d="M 4 4 L 8 12 L 4 20 L 12 16 L 20 20 L 16 12 L 28 8" stroke="#8b6f47" strokeWidth="2" fill="none" />
                  </svg>
                </div>

                {/* Icono más tenue */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-5xl opacity-70 filter drop-shadow-md">📦</div>
                </div>

                {/* Indicador de vida */}
                <div className="absolute bottom-2 right-2 w-7 h-7 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 border-white">
                  1
                </div>
              </div>
            )}
          </div>
        )}

        {/* EXPLOSIÓN DE TROZOS DE PAPEL */}
        {isShatteringRock && (
          <div className="absolute inset-0 overflow-visible">
            {ROCK_PARTICLES.map((particle, i) => {
              const radian = (particle.angle * Math.PI) / 180;
              const tx = Math.cos(radian) * particle.distance;
              const ty = Math.sin(radian) * particle.distance;

              return (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '50%',
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    background: i % 3 === 0
                      ? 'linear-gradient(135deg, #d4a574 0%, #b8956a 100%)'
                      : i % 3 === 1
                      ? 'linear-gradient(135deg, #e8c9a1 0%, #d4a574 100%)'
                      : 'linear-gradient(135deg, #c19968 0%, #9e7e5a 100%)',
                    borderRadius: '2px',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
                    transform: isShatteringRock
                      ? `translate(${tx}px, ${ty}px) rotate(${particle.angle * 3}deg) scale(0)`
                      : 'translate(-50%, -50%) rotate(0deg) scale(1)',
                    opacity: isShatteringRock ? 0 : 1,
                    transition: `all ${particle.duration}ms ease-out ${particle.delay}ms`,
                  }}
                />
              );
            })}

            {/* Polvo/partículas pequeñas */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`dust-${i}`}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  background: 'rgba(180, 149, 106, 0.8)',
                  transform: isShatteringRock
                    ? `translate(${Math.cos((i * 60 * Math.PI) / 180) * 65}px, ${Math.sin((i * 60 * Math.PI) / 180) * 65}px) scale(0)`
                    : 'translate(-50%, -50%) scale(1)',
                  opacity: isShatteringRock ? 0 : 0.7,
                  transition: `all 450ms ease-out ${i * 40}ms`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
};
