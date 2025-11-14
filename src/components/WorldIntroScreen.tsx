import { useEffect, useState } from 'react';
import { Leaf, Dumbbell, Gamepad2, PawPrint, Rocket, Sparkles } from 'lucide-react';

interface WorldIntroScreenProps {
  world: number;
  onStart: () => void;
}

const worldData = [
  {
    name: 'Naturaleza',
    icon: Leaf,
    emoji: '🌿',
    description: 'Explora la belleza del mundo natural',
    color: { from: 'from-emerald-500', to: 'to-green-700', bg: 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600' },
    features: ['6-10 parejas', '60-45 segundos', '55 monedas totales']
  },
  {
    name: 'Deportes',
    icon: Dumbbell,
    emoji: '⚽',
    description: 'Pon a prueba tu memoria deportiva',
    color: { from: 'from-yellow-500', to: 'to-orange-700', bg: 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600' },
    features: ['8-12 parejas', '55-40 segundos', '98 monedas totales']
  },
  {
    name: 'Juegos',
    icon: Gamepad2,
    emoji: '🎮',
    description: 'El paraíso de los gamers te espera',
    color: { from: 'from-purple-500', to: 'to-pink-700', bg: 'bg-gradient-to-br from-purple-400 via-pink-500 to-rose-600' },
    features: ['10-14 parejas', '50-35 segundos', '137 monedas totales']
  },
  {
    name: 'Animales',
    icon: PawPrint,
    emoji: '🐾',
    description: 'Descubre el reino animal',
    color: { from: 'from-orange-500', to: 'to-red-700', bg: 'bg-gradient-to-br from-orange-400 via-red-500 to-pink-600' },
    features: ['12-16 parejas', '45-30 segundos', '190 monedas totales']
  },
  {
    name: 'Espacio',
    icon: Rocket,
    emoji: '🚀',
    description: 'Viaja más allá de las estrellas',
    color: { from: 'from-indigo-500', to: 'to-blue-700', bg: 'bg-gradient-to-br from-indigo-400 via-blue-500 to-cyan-600' },
    features: ['14-18 parejas', '40-25 segundos', '260 monedas totales']
  }
];

export function WorldIntroScreen({ world, onStart }: WorldIntroScreenProps) {
  const [isVisible, setIsVisible] = useState(false);
  const data = worldData[world - 1];
  const Icon = data.icon;

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <div className={`fixed inset-0 ${data.color.bg} flex items-center justify-center p-6 z-50`}>
      <div className={`max-w-lg w-full transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>

        <div className="text-center mb-8">
          <div className="inline-block relative mb-6">
            <div className="absolute inset-0 bg-white/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="relative text-9xl animate-bounce-slow">
              {data.emoji}
            </div>
          </div>

          <div className="mb-4 flex justify-center gap-2">
            <Sparkles className="text-yellow-300 animate-pulse" size={24} />
            <h1 className="text-5xl font-black text-white drop-shadow-2xl">
              Mundo {world}
            </h1>
            <Sparkles className="text-yellow-300 animate-pulse" size={24} />
          </div>

          <h2 className="text-3xl font-bold text-white/90 mb-3 drop-shadow-lg">
            {data.name}
          </h2>

          <p className="text-xl text-white/80 font-medium">
            {data.description}
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Icon className={`bg-gradient-to-br ${data.color.from} ${data.color.to} text-white p-2 rounded-xl`} size={40} />
            <h3 className="text-2xl font-bold text-gray-800">Características</h3>
          </div>

          <div className="space-y-3">
            {data.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 text-gray-700 text-lg"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${data.color.from} ${data.color.to}`}></div>
                <span className="font-semibold">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full bg-white text-gray-800 py-5 rounded-2xl font-black text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all hover:shadow-3xl"
        >
          ¡COMENZAR! 🎯
        </button>

        <div className="mt-4 text-center">
          <p className="text-white/70 text-sm font-medium">
            5 niveles de diversión te esperan
          </p>
        </div>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
