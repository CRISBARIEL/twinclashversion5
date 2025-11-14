import { useState, useEffect } from 'react';
import { Card } from '../types';

interface ObstacleOverlayProps {
  card: Card;
  isBreaking?: boolean;
}

/**
 * PARTÍCULAS DE HIELO
 * Define las posiciones y direcciones de las partículas que salen despedidas
 * cuando el hielo se rompe.
 *
 * Cada partícula tiene:
 * - initialX, initialY: Posición inicial en % (desde el centro)
 * - translateX, translateY: Dirección del movimiento en px
 * - delay: Retraso de la animación en ms (para efecto escalonado)
 *
 * PARA AÑADIR MÁS PARTÍCULAS: Añade más objetos a este array
 * PARA CAMBIAR DIRECCIONES: Modifica translateX/translateY (valores negativos = izquierda/arriba)
 */
const ICE_PARTICLES = [
  { initialX: '50%', initialY: '50%', translateX: -40, translateY: -50, delay: 0 },
  { initialX: '50%', initialY: '50%', translateX: 40, translateY: -50, delay: 50 },
  { initialX: '50%', initialY: '50%', translateX: -50, translateY: 20, delay: 100 },
  { initialX: '50%', initialY: '50%', translateX: 50, translateY: 20, delay: 150 },
  { initialX: '50%', initialY: '50%', translateX: 0, translateY: -60, delay: 75 },
  { initialX: '50%', initialY: '50%', translateX: -60, translateY: 0, delay: 125 },
  { initialX: '50%', initialY: '50%', translateX: 60, translateY: 0, delay: 175 },
  { initialX: '50%', initialY: '50%', translateX: 0, translateY: 50, delay: 200 },
];

/**
 * Componente que renderiza el overlay visual de los obstáculos (hielo y piedra)
 * sobre las cartas del juego.
 *
 * HIELO:
 * - Se rompe con un solo golpe (health = 1)
 * - Tiene un efecto visual de hielo translúcido con copo de nieve
 * - Cuando se rompe, muestra una animación de explosión con partículas
 *
 * PIEDRA:
 * - Requiere dos golpes para romperse (health = 2 → 1 → 0)
 * - Health 2: Piedra sólida con textura oscura y emoji de roca
 * - Health 1: Piedra agrietada más clara, como si estuviera medio rota
 */
export const ObstacleOverlay = ({ card, isBreaking = false }: ObstacleOverlayProps) => {
  /**
   * Estado local para controlar la animación de rotura del hielo
   *
   * - isShatteringIce: true cuando el hielo está en proceso de romperse (600ms)
   * - previousHealth: guarda la salud anterior para detectar el momento exacto de rotura
   */
  const [isShatteringIce, setIsShatteringIce] = useState(false);
  const [previousHealth, setPreviousHealth] = useState(card.obstacleHealth);

  /**
   * DETECCIÓN DE ROTURA DEL HIELO
   *
   * useEffect que monitorea cambios en la salud del obstáculo.
   * Cuando detecta que:
   * 1. El obstáculo es de tipo 'ice'
   * 2. La salud anterior era > 0
   * 3. La salud actual es <= 0
   *
   * → Activa la animación de rotura (isShatteringIce = true) durante 600ms
   *
   * Este tiempo (600ms) debe coincidir con la duración de la animación CSS
   * de las partículas para que terminen de desvanecerse antes de que el
   * componente deje de renderizarse.
   */
  useEffect(() => {
    if (
      card.obstacle === 'ice' &&
      previousHealth !== undefined &&
      previousHealth > 0 &&
      (card.obstacleHealth ?? 0) <= 0
    ) {
      // El hielo acaba de romperse, activar animación de explosión
      setIsShatteringIce(true);

      // Después de 600ms, limpiar el estado de animación
      const timeout = setTimeout(() => {
        setIsShatteringIce(false);
      }, 600);

      return () => clearTimeout(timeout);
    }

    // Actualizar la salud previa para la próxima comparación
    setPreviousHealth(card.obstacleHealth);
  }, [card.obstacle, card.obstacleHealth, previousHealth]);

  const hasObstacle = card.obstacle && (card.obstacleHealth ?? 0) > 0;

  // Si no hay obstáculo Y no se está rompiendo el hielo, no renderizar nada
  if (!hasObstacle && !isShatteringIce) return null;

  /**
   * ==========================================
   * OVERLAY DE HIELO
   * ==========================================
   *
   * ESTADO NORMAL (health > 0):
   * - Fondo translúcido azul/celeste con blur
   * - Copo de nieve centrado con animación pulse
   * - Reflejos y brillos para simular cristal
   *
   * ESTADO DE ROTURA (isShatteringIce = true):
   * - El overlay completo hace scale + fade (se expande y desvanece)
   * - Aparecen 8 partículas que salen disparadas en diferentes direcciones
   * - Las partículas se mueven, rotan y desvanecen en 600ms
   * - Después de 600ms, el componente deja de renderizarse
   */
  if (card.obstacle === 'ice') {
    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* OVERLAY PRINCIPAL DE HIELO */}
        {hasObstacle && (
          <div
            className={`absolute inset-0 rounded-xl overflow-visible transition-all ${
              isBreaking || isShatteringIce
                ? 'duration-500 opacity-0 scale-125' // Animación de rotura: se expande y desvanece
                : 'duration-300 opacity-100 scale-100' // Estado normal
            }`}
          >
            {/* Fondo de hielo con degradado celeste y blur */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-200/80 via-sky-300/80 to-sky-400/80 backdrop-blur-sm border-2 border-cyan-100/80 rounded-xl"></div>

            {/* Efectos de brillo y reflejos de hielo */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-cyan-400/30 via-transparent to-transparent rounded-xl"></div>

            {/* Copo de nieve centrado */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-5xl drop-shadow-lg animate-pulse">❄️</div>
            </div>

            {/* Borde brillante */}
            <div className="absolute inset-0 rounded-xl border-2 border-white/40"></div>
          </div>
        )}

        {/*
          PARTÍCULAS DE HIELO

          Solo se renderizan cuando isShatteringIce = true (durante 600ms).

          Cada partícula:
          1. Comienza en el centro del hielo
          2. Se mueve hacia su dirección asignada (translateX/translateY)
          3. Rota mientras se mueve (rotate-45, -rotate-90, etc.)
          4. Se desvanece gradualmente (opacity: 1 → 0)
          5. Tiene un delay escalonado para efecto más natural

          PERSONALIZACIÓN:
          - Tamaño: w-3 h-3 (cambiar a w-2 h-2 o w-4 h-4)
          - Color: bg-cyan-100, bg-sky-200, bg-white (cualquier color de hielo)
          - Duración: duration-[600ms] (cambiar el número en ms)
        */}
        {isShatteringIce && (
          <div className="absolute inset-0 overflow-visible pointer-events-none">
            {ICE_PARTICLES.map((particle, index) => (
              <div
                key={index}
                className="absolute w-3 h-3 rounded-full shadow-lg transition-all duration-[600ms] ease-out"
                style={{
                  left: particle.initialX,
                  top: particle.initialY,
                  backgroundColor: index % 3 === 0 ? '#e0f2fe' : index % 3 === 1 ? '#bae6fd' : '#ffffff',
                  transform: isShatteringIce
                    ? `translate(${particle.translateX}px, ${particle.translateY}px) rotate(${particle.translateX * 3}deg) scale(0.3)`
                    : 'translate(-50%, -50%) rotate(0deg) scale(1)',
                  opacity: isShatteringIce ? 0 : 1,
                  transitionDelay: `${particle.delay}ms`,
                }}
              />
            ))}

            {/* Partículas adicionales tipo "chispas" (más pequeñas y rápidas) */}
            {[...Array(6)].map((_, i) => (
              <div
                key={`spark-${i}`}
                className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-80 transition-all duration-[400ms] ease-out"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: isShatteringIce
                    ? `translate(${Math.cos((i * 60 * Math.PI) / 180) * 70}px, ${Math.sin((i * 60 * Math.PI) / 180) * 70}px) scale(0)`
                    : 'translate(-50%, -50%) scale(1)',
                  opacity: isShatteringIce ? 0 : 0.8,
                  transitionDelay: `${i * 30}ms`,
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
   * OVERLAY DE PIEDRA
   * ==========================================
   *
   * Tiene dos estados visuales según su salud (health)
   */
  if (card.obstacle === 'stone') {
    // PIEDRA SÓLIDA (health = 2)
    // Apariencia de bloque de roca completo, oscuro y pesado
    if (card.obstacleHealth === 2) {
      return (
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          {/* Fondo de piedra con textura y degradado oscuro */}
          <div className="absolute inset-0 bg-gradient-to-br from-stone-600 via-stone-700 to-stone-900"></div>

          {/* Textura de piedra con patrones */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/20 to-black/40"></div>
            <div className="absolute inset-0" style={{
              backgroundImage: `
                radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.15) 0%, transparent 15%),
                radial-gradient(circle at 80% 20%, rgba(0, 0, 0, 0.25) 0%, transparent 20%),
                radial-gradient(circle at 60% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 18%)
              `
            }}></div>
          </div>

          {/* Sombra interna para dar profundidad */}
          <div className="absolute inset-0 shadow-inner-stone"></div>

          {/* Emoji de roca centrado */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-5xl drop-shadow-2xl">🪨</div>
          </div>

          {/* Indicador de vida (2 golpes restantes) */}
          <div className="absolute bottom-2 right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 border-white z-20">
            2
          </div>

          {/* Bordes de roca */}
          <div className="absolute inset-0 rounded-xl border-2 border-stone-800/50"></div>
        </div>
      );
    }

    // PIEDRA AGRIETADA (health = 1)
    // Apariencia de roca dañada, más clara, con grietas visibles
    if (card.obstacleHealth === 1) {
      return (
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          {/* Fondo de piedra más claro (medio rota) */}
          <div className="absolute inset-0 bg-gradient-to-br from-stone-400 via-stone-500 to-stone-600"></div>

          {/* Grietas y fracturas */}
          <div className="absolute inset-0">
            {/* Grieta diagonal principal */}
            <div className="absolute top-0 left-1/4 w-1 h-full bg-black/60 transform -rotate-12"></div>
            <div className="absolute top-0 left-1/4 w-0.5 h-full bg-white/20 transform -rotate-12 translate-x-1"></div>

            {/* Grieta horizontal */}
            <div className="absolute top-1/3 left-0 w-full h-1 bg-black/50"></div>
            <div className="absolute top-1/3 left-0 w-full h-0.5 bg-white/30 translate-y-1"></div>

            {/* Grieta diagonal secundaria */}
            <div className="absolute top-0 right-1/3 w-0.5 h-full bg-black/40 transform rotate-20"></div>
          </div>

          {/* Overlay de daño (más transparente que la piedra sólida) */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/30 to-black/50"></div>

          {/* Emoji de roca más tenue */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-5xl opacity-60 drop-shadow-lg">🪨</div>
          </div>

          {/* Indicador de vida (1 golpe restante) */}
          <div className="absolute bottom-2 right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 border-white z-20">
            1
          </div>

          {/* Borde agrietado */}
          <div className="absolute inset-0 rounded-xl border-2 border-stone-600/50"></div>
        </div>
      );
    }
  }

  return null;
};
