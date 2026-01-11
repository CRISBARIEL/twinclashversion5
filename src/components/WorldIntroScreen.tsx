import { useEffect, useState } from 'react';
import { Leaf, Dumbbell, Gamepad2, PawPrint, Rocket, Sparkles, Waves, Pizza, Music, Sparkle, Cpu, Building2, Microscope, Tractor, Palette, Car, Shirt, Bone, Candy, Eye, Users, Smile, Skull, Gem, Bug, Apple, Carrot, Wine, Castle, Trees, Mountain, Snowflake, MapPin, Coffee, Zap, Film, Scroll, Shield, Bot, User, TrendingUp, Flame } from 'lucide-react';
import { soundManager } from '../lib/sound';

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
    features: ['10 parejas', '40-25 segundos', '260 monedas totales']
  },
  {
    name: 'Océano',
    icon: Waves,
    emoji: '🌊',
    description: 'Sumérgete en las profundidades',
    color: { from: 'from-blue-500', to: 'to-teal-700', bg: 'bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-600' },
    features: ['10 parejas', '38-22 segundos', '340 monedas totales']
  },
  {
    name: 'Comida',
    icon: Pizza,
    emoji: '🍕',
    description: 'Un festín para tus sentidos',
    color: { from: 'from-red-500', to: 'to-orange-700', bg: 'bg-gradient-to-br from-red-400 via-orange-500 to-yellow-600' },
    features: ['10 parejas', '36-20 segundos', '420 monedas totales']
  },
  {
    name: 'Música',
    icon: Music,
    emoji: '🎵',
    description: 'Siente el ritmo de la memoria',
    color: { from: 'from-pink-500', to: 'to-purple-700', bg: 'bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600' },
    features: ['10 parejas', '34-18 segundos', '500 monedas totales']
  },
  {
    name: 'Belleza',
    icon: Sparkle,
    emoji: '💄',
    description: 'El glamour te está esperando',
    color: { from: 'from-rose-500', to: 'to-pink-700', bg: 'bg-gradient-to-br from-rose-400 via-pink-500 to-fuchsia-600' },
    features: ['10 parejas', '32-16 segundos', '580 monedas totales']
  },
  {
    name: 'Tecnología',
    icon: Cpu,
    emoji: '💻',
    description: 'El futuro digital es ahora',
    color: { from: 'from-cyan-500', to: 'to-blue-700', bg: 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600' },
    features: ['10 parejas', '30-15 segundos', '660 monedas totales']
  },
  {
    name: 'Ciudad',
    icon: Building2,
    emoji: '🏙️',
    description: 'La vida urbana te espera',
    color: { from: 'from-gray-500', to: 'to-slate-700', bg: 'bg-gradient-to-br from-gray-400 via-slate-500 to-zinc-600' },
    features: ['10 parejas', '28-14 segundos', '740 monedas totales']
  },
  {
    name: 'Ciencia',
    icon: Microscope,
    emoji: '🔬',
    description: 'Descubre los secretos del universo',
    color: { from: 'from-green-500', to: 'to-emerald-700', bg: 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600' },
    features: ['10 parejas', '26-13 segundos', '820 monedas totales']
  },
  {
    name: 'Granja',
    icon: Tractor,
    emoji: '🚜',
    description: 'La vida en el campo',
    color: { from: 'from-amber-500', to: 'to-yellow-700', bg: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-600' },
    features: ['10 parejas', '24-12 segundos', '900 monedas totales']
  },
  {
    name: 'Arte',
    icon: Palette,
    emoji: '🎨',
    description: 'Expresa tu creatividad',
    color: { from: 'from-violet-500', to: 'to-purple-700', bg: 'bg-gradient-to-br from-violet-400 via-purple-500 to-fuchsia-600' },
    features: ['10 parejas', '22-11 segundos', '980 monedas totales']
  },
  {
    name: 'Transporte',
    icon: Car,
    emoji: '🚗',
    description: 'Muévete por el mundo',
    color: { from: 'from-red-500', to: 'to-rose-700', bg: 'bg-gradient-to-br from-red-400 via-rose-500 to-pink-600' },
    features: ['10 parejas', '20-10 segundos', '1060 monedas totales']
  },
  {
    name: 'Ropa',
    icon: Shirt,
    emoji: '👕',
    description: 'La moda está en tus manos',
    color: { from: 'from-pink-500', to: 'to-rose-700', bg: 'bg-gradient-to-br from-pink-400 via-rose-500 to-red-600' },
    features: ['10 parejas', '120-45 segundos', '1160 monedas totales']
  },
  {
    name: 'Dinosaurios',
    icon: Bone,
    emoji: '🦕',
    description: 'Viaja a la era prehistórica',
    color: { from: 'from-lime-500', to: 'to-green-700', bg: 'bg-gradient-to-br from-lime-400 via-green-500 to-emerald-600' },
    features: ['10 parejas', '100-40 segundos', '1260 monedas totales']
  },
  {
    name: 'Dulces',
    icon: Candy,
    emoji: '🍬',
    description: 'Un mundo de azúcar',
    color: { from: 'from-fuchsia-500', to: 'to-pink-700', bg: 'bg-gradient-to-br from-fuchsia-400 via-pink-500 to-rose-600' },
    features: ['10 parejas', '80-35 segundos', '1360 monedas totales']
  },
  {
    name: 'Camisetas',
    icon: Shirt,
    emoji: '👕',
    description: 'Estilo y diseño únicos',
    color: { from: 'from-sky-500', to: 'to-blue-700', bg: 'bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-600' },
    features: ['10 parejas', '60-30 segundos', '1460 monedas totales']
  },
  {
    name: 'Ojos',
    icon: Eye,
    emoji: '👁️',
    description: 'Observa con atención',
    color: { from: 'from-teal-500', to: 'to-cyan-700', bg: 'bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-600' },
    features: ['10 parejas', '50-28 segundos', '1560 monedas totales']
  },
  {
    name: 'Profesiones',
    icon: Users,
    emoji: '👨‍⚕️',
    description: 'El mundo del trabajo',
    color: { from: 'from-blue-500', to: 'to-indigo-700', bg: 'bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600' },
    features: ['10 parejas', '45-26 segundos', '1660 monedas totales']
  },
  {
    name: 'Emociones',
    icon: Smile,
    emoji: '😊',
    description: 'Expresa tus sentimientos',
    color: { from: 'from-yellow-500', to: 'to-amber-700', bg: 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600' },
    features: ['10 parejas', '40-24 segundos', '1760 monedas totales']
  },
  {
    name: 'Piratas',
    icon: Skull,
    emoji: '🏴‍☠️',
    description: 'Zarpa hacia la aventura',
    color: { from: 'from-slate-500', to: 'to-gray-700', bg: 'bg-gradient-to-br from-slate-400 via-gray-500 to-zinc-600' },
    features: ['10 parejas', '38-22 segundos', '1860 monedas totales']
  },
  {
    name: 'Joyas',
    icon: Gem,
    emoji: '💎',
    description: 'Tesoros brillantes',
    color: { from: 'from-purple-500', to: 'to-pink-700', bg: 'bg-gradient-to-br from-purple-400 via-pink-500 to-fuchsia-600' },
    features: ['10 parejas', '36-20 segundos', '1960 monedas totales']
  },
  {
    name: 'Videojuegos',
    icon: Gamepad2,
    emoji: '🎮',
    description: 'El nivel definitivo',
    color: { from: 'from-indigo-500', to: 'to-blue-700', bg: 'bg-gradient-to-br from-indigo-400 via-blue-500 to-cyan-600' },
    features: ['10 parejas', '34-18 segundos', '2060 monedas totales']
  },
  {
    name: 'Insectos',
    icon: Bug,
    emoji: '🐛',
    description: 'El mundo de los pequeños',
    color: { from: 'from-green-500', to: 'to-lime-700', bg: 'bg-gradient-to-br from-green-400 via-lime-500 to-emerald-600' },
    features: ['10 parejas', '32-16 segundos', '2160 monedas totales']
  },
  {
    name: 'Frutas',
    icon: Apple,
    emoji: '🍎',
    description: 'Sabores naturales',
    color: { from: 'from-red-500', to: 'to-orange-700', bg: 'bg-gradient-to-br from-red-400 via-orange-500 to-yellow-600' },
    features: ['10 parejas', '30-15 segundos', '2260 monedas totales']
  },
  {
    name: 'Verduras',
    icon: Carrot,
    emoji: '🥕',
    description: 'Nutrición y salud',
    color: { from: 'from-orange-500', to: 'to-green-700', bg: 'bg-gradient-to-br from-orange-400 via-green-500 to-lime-600' },
    features: ['10 parejas', '28-14 segundos', '2360 monedas totales']
  },
  {
    name: 'Botellas',
    icon: Wine,
    emoji: '🍾',
    description: 'Colección especial',
    color: { from: 'from-rose-500', to: 'to-red-700', bg: 'bg-gradient-to-br from-rose-400 via-red-500 to-pink-600' },
    features: ['10 parejas', '26-13 segundos', '2460 monedas totales']
  },
  {
    name: 'Castillo',
    icon: Castle,
    emoji: '🏰',
    description: 'Fortalezas medievales',
    color: { from: 'from-stone-500', to: 'to-gray-700', bg: 'bg-gradient-to-br from-stone-400 via-gray-500 to-slate-600' },
    features: ['10 parejas', '24-12 segundos', '2560 monedas totales']
  },
  {
    name: 'Bosque',
    icon: Trees,
    emoji: '🌲',
    description: 'La naturaleza salvaje',
    color: { from: 'from-emerald-500', to: 'to-green-700', bg: 'bg-gradient-to-br from-emerald-400 via-green-500 to-lime-600' },
    features: ['10 parejas', '22-11 segundos', '2660 monedas totales']
  },
  {
    name: 'Montañas',
    icon: Mountain,
    emoji: '⛰️',
    description: 'Conquista las cumbres',
    color: { from: 'from-gray-500', to: 'to-blue-700', bg: 'bg-gradient-to-br from-gray-400 via-blue-500 to-cyan-600' },
    features: ['10 parejas', '20-10 segundos', '2760 monedas totales']
  },
  {
    name: 'Nieve',
    icon: Snowflake,
    emoji: '❄️',
    description: 'El frío invernal',
    color: { from: 'from-cyan-500', to: 'to-blue-700', bg: 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600' },
    features: ['10 parejas', '120-45 segundos', '2860 monedas totales']
  },
  {
    name: 'Lugares',
    icon: MapPin,
    emoji: '🗺️',
    description: 'Viaja por el mundo',
    color: { from: 'from-amber-500', to: 'to-orange-700', bg: 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-600' },
    features: ['10 parejas', '100-40 segundos', '2960 monedas totales']
  },
  {
    name: 'Tazas',
    icon: Coffee,
    emoji: '☕',
    description: 'La hora del café',
    color: { from: 'from-brown-500', to: 'to-amber-700', bg: 'bg-gradient-to-br from-amber-600 via-orange-700 to-red-800' },
    features: ['10 parejas', '80-35 segundos', '3060 monedas totales']
  },
  {
    name: 'Energía',
    icon: Zap,
    emoji: '⚡',
    description: 'Poder eléctrico',
    color: { from: 'from-yellow-500', to: 'to-orange-700', bg: 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600' },
    features: ['10 parejas', '60-30 segundos', '3160 monedas totales']
  },
  {
    name: 'Dinosaurios',
    icon: Bone,
    emoji: '🦖',
    description: 'Criaturas prehistóricas',
    color: { from: 'from-lime-500', to: 'to-green-700', bg: 'bg-gradient-to-br from-lime-400 via-green-500 to-emerald-600' },
    features: ['10 parejas', '50-28 segundos', '3260 monedas totales']
  },
  {
    name: 'Música',
    icon: Music,
    emoji: '🎶',
    description: 'Melodías inolvidables',
    color: { from: 'from-pink-500', to: 'to-purple-700', bg: 'bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600' },
    features: ['10 parejas', '45-26 segundos', '3360 monedas totales']
  },
  {
    name: 'Verano',
    icon: Flame,
    emoji: '☀️',
    description: 'El calor del verano',
    color: { from: 'from-yellow-500', to: 'to-orange-700', bg: 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600' },
    features: ['10 parejas', '40-24 segundos', '3460 monedas totales']
  },
  {
    name: 'Primavera',
    icon: Sparkles,
    emoji: '🌸',
    description: 'Flores y colores',
    color: { from: 'from-pink-500', to: 'to-rose-700', bg: 'bg-gradient-to-br from-pink-400 via-rose-500 to-fuchsia-600' },
    features: ['10 parejas', '38-22 segundos', '3560 monedas totales']
  },
  {
    name: 'Otoño',
    icon: Leaf,
    emoji: '🍂',
    description: 'La caída de las hojas',
    color: { from: 'from-orange-500', to: 'to-red-700', bg: 'bg-gradient-to-br from-orange-400 via-red-500 to-amber-600' },
    features: ['10 parejas', '36-20 segundos', '3660 monedas totales']
  },
  {
    name: 'Invierno',
    icon: Snowflake,
    emoji: '⛄',
    description: 'La estación helada',
    color: { from: 'from-blue-500', to: 'to-cyan-700', bg: 'bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-600' },
    features: ['10 parejas', '34-18 segundos', '3760 monedas totales']
  },
  {
    name: 'Cine',
    icon: Film,
    emoji: '🎬',
    description: 'La magia del séptimo arte',
    color: { from: 'from-gray-500', to: 'to-slate-700', bg: 'bg-gradient-to-br from-gray-400 via-slate-500 to-zinc-600' },
    features: ['10 parejas', '32-16 segundos', '3860 monedas totales']
  },
  {
    name: 'Historia',
    icon: Scroll,
    emoji: '📜',
    description: 'Viaja en el tiempo',
    color: { from: 'from-amber-500', to: 'to-yellow-700', bg: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-600' },
    features: ['10 parejas', '30-15 segundos', '3960 monedas totales']
  },
  {
    name: 'Superhéroes',
    icon: Shield,
    emoji: '🦸',
    description: 'Poderes extraordinarios',
    color: { from: 'from-red-500', to: 'to-blue-700', bg: 'bg-gradient-to-br from-red-400 via-blue-500 to-purple-600' },
    features: ['10 parejas', '28-14 segundos', '4060 monedas totales']
  },
  {
    name: 'Robots',
    icon: Bot,
    emoji: '🤖',
    description: 'La era de las máquinas',
    color: { from: 'from-slate-500', to: 'to-gray-700', bg: 'bg-gradient-to-br from-slate-400 via-gray-500 to-zinc-600' },
    features: ['10 parejas', '26-13 segundos', '4160 monedas totales']
  },
  {
    name: 'Astronautas',
    icon: User,
    emoji: '👨‍🚀',
    description: 'Exploradores del espacio',
    color: { from: 'from-indigo-500', to: 'to-purple-700', bg: 'bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-600' },
    features: ['10 parejas', '24-12 segundos', '4260 monedas totales']
  },
  {
    name: 'Castillos',
    icon: Castle,
    emoji: '🏰',
    description: 'Fortalezas legendarias',
    color: { from: 'from-stone-500', to: 'to-gray-700', bg: 'bg-gradient-to-br from-stone-400 via-gray-500 to-slate-600' },
    features: ['10 parejas', '22-11 segundos', '4360 monedas totales']
  },
  {
    name: 'Tesoros',
    icon: TrendingUp,
    emoji: '💰',
    description: 'Riquezas ocultas',
    color: { from: 'from-yellow-500', to: 'to-orange-700', bg: 'bg-gradient-to-br from-yellow-400 via-orange-500 to-amber-600' },
    features: ['10 parejas', '20-10 segundos', '4460 monedas totales']
  },
  {
    name: 'Volcán',
    icon: Flame,
    emoji: '🌋',
    description: 'El desafío final',
    color: { from: 'from-red-500', to: 'to-orange-700', bg: 'bg-gradient-to-br from-red-600 via-orange-600 to-yellow-500' },
    features: ['10 parejas', '18-9 segundos', '4560 monedas totales']
  }
];

export function WorldIntroScreen({ world, onStart }: WorldIntroScreenProps) {
  const [isVisible, setIsVisible] = useState(false);
  const data = worldData[world - 1];
  const Icon = data.icon;

  useEffect(() => {
    soundManager.playWin();
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <div className={`fixed inset-0 ${data.color.bg} flex items-center justify-center p-4 sm:p-6 z-50 overflow-y-auto`}>
      <div className={`max-w-lg w-full transition-all duration-700 my-auto ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>

        <div className="text-center mb-4 sm:mb-8">
          <div className="inline-block relative mb-3 sm:mb-6">
            <div className="absolute inset-0 bg-white/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="relative text-6xl sm:text-9xl animate-bounce-slow">
              {data.emoji}
            </div>
          </div>

          <div className="mb-2 sm:mb-4 flex justify-center gap-2">
            <Sparkles className="text-yellow-300 animate-pulse" size={20} />
            <h1 className="text-3xl sm:text-5xl font-black text-white drop-shadow-2xl">
              Mundo {world}
            </h1>
            <Sparkles className="text-yellow-300 animate-pulse" size={20} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white/90 mb-2 sm:mb-3 drop-shadow-lg">
            {data.name}
          </h2>

          <p className="text-base sm:text-xl text-white/80 font-medium">
            {data.description}
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-4 sm:p-6 shadow-2xl mb-4 sm:mb-6">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Icon className={`bg-gradient-to-br ${data.color.from} ${data.color.to} text-white p-2 rounded-xl`} size={32} />
            <h3 className="text-lg sm:text-2xl font-bold text-gray-800">Características</h3>
          </div>

          <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-5">
            {data.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-lg"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${data.color.from} ${data.color.to}`}></div>
                <span className="font-semibold">{feature}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-3 sm:pt-4">
            <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3 text-center">💡 Ayudas</h4>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span className="font-semibold">⚡ 20% Parejas</span>
                <span className="ml-auto text-yellow-600 font-bold">600 🪙</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">✨ 40% Parejas</span>
                <span className="ml-auto text-yellow-600 font-bold">1000 🪙</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">⏱️ +10s Tiempo</span>
                <span className="ml-auto text-yellow-600 font-bold">1000 🪙</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">⏱️ +15s Tiempo</span>
                <span className="ml-auto text-yellow-600 font-bold">1400 🪙</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 sm:mt-3 text-center">
              Ayudas de tiempo congelan el reloj
            </p>
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full bg-white text-gray-800 py-4 sm:py-5 rounded-2xl font-black text-xl sm:text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all hover:shadow-3xl"
        >
          ¡COMENZAR! 🎯
        </button>

        <div className="mt-3 sm:mt-4 text-center">
          <p className="text-white/70 text-xs sm:text-sm font-medium">
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
