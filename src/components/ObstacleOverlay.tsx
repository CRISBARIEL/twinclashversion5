import { Card } from '../types';

interface ObstacleOverlayProps {
  card: Card;
  isBreaking?: boolean;
}

/**
 * Componente que renderiza el overlay visual de los obstáculos (hielo y piedra)
 * sobre las cartas del juego.
 *
 * HIELO:
 * - Se rompe con un solo golpe (health = 1)
 * - Tiene un efecto visual de hielo translúcido con copo de nieve
 * - Cuando se rompe, desaparece con una animación suave
 *
 * PIEDRA:
 * - Requiere dos golpes para romperse (health = 2 → 1 → 0)
 * - Health 2: Piedra sólida con textura oscura y emoji de roca
 * - Health 1: Piedra agrietada más clara, como si estuviera medio rota
 */
export const ObstacleOverlay = ({ card, isBreaking = false }: ObstacleOverlayProps) => {
  const hasObstacle = card.obstacle && (card.obstacleHealth ?? 0) > 0;

  if (!hasObstacle) return null;

  // OVERLAY DE HIELO
  // Efecto translúcido azul/celeste con copo de nieve
  // Se rompe con un solo golpe y desaparece suavemente
  if (card.obstacle === 'ice') {
    return (
      <div
        className={`absolute inset-0 rounded-xl overflow-hidden transition-all duration-500 ${
          isBreaking ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
        }`}
      >
        {/* Fondo de hielo con degradado celeste y blur */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-200/80 via-sky-300/80 to-sky-400/80 backdrop-blur-sm border-2 border-cyan-100/80"></div>

        {/* Efectos de brillo y reflejos de hielo */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-cyan-400/30 via-transparent to-transparent"></div>

        {/* Copo de nieve centrado */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-5xl drop-shadow-lg animate-pulse">❄️</div>
        </div>

        {/* Borde brillante */}
        <div className="absolute inset-0 rounded-xl border-2 border-white/40"></div>
      </div>
    );
  }

  // OVERLAY DE PIEDRA
  // Tiene dos estados visuales según su salud (health)
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
