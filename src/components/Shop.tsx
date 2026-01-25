import { useState, useEffect } from 'react';
import { X, Coins, Check, Lock, ShoppingBag, Leaf, Dumbbell, Gamepad2, PawPrint, Rocket, Waves, Pizza, Music, Sparkles, Cpu, Heart } from 'lucide-react';
import { getLocalCoins } from '../lib/progression';
import { CoinShop } from './CoinShop';
import { purchaseWorld, isWorldPurchased, WORLD_COSTS } from '../lib/worldProgress';
import { buyLives, getUserLives } from '../lib/progressionService';
import { supabase } from '../lib/supabase';

interface ShopProps {
  onClose: () => void;
  onSkinChanged: () => void;
}

const worldIcons = [Leaf, Dumbbell, Gamepad2, PawPrint, Rocket, Waves, Pizza, Music, Sparkles, Cpu];
const worldNames = ['Naturaleza', 'Deportes', 'Juegos', 'Animales', 'Espacio', 'Océano', 'Comida', 'Música', 'Belleza', 'Tecnología'];
const worldColors = [
  { from: 'from-emerald-500', to: 'to-green-700' },
  { from: 'from-yellow-500', to: 'to-orange-700' },
  { from: 'from-purple-500', to: 'to-pink-700' },
  { from: 'from-orange-500', to: 'to-red-700' },
  { from: 'from-indigo-500', to: 'to-blue-700' },
  { from: 'from-cyan-500', to: 'to-teal-700' },
  { from: 'from-red-500', to: 'to-pink-700' },
  { from: 'from-violet-500', to: 'to-purple-700' },
  { from: 'from-fuchsia-500', to: 'to-pink-700' },
  { from: 'from-slate-500', to: 'to-gray-700' },
];

export const Shop = ({ onClose, onSkinChanged }: ShopProps) => {
  const [coins, setCoins] = useState(getLocalCoins());
  const [ownedWorlds, setOwnedWorlds] = useState<Record<number, boolean>>({ 1: true });
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [showCoinShop, setShowCoinShop] = useState(false);
  const [currentLives, setCurrentLives] = useState(5);
  const [buyingLives, setBuyingLives] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar mundos
        const owned: Record<number, boolean> = { 1: true };
        for (let i = 2; i <= 10; i++) {
          const purchased = await isWorldPurchased(`world-${i}`);
          owned[i] = purchased;
        }
        setOwnedWorlds(owned);

        // Cargar vidas
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const lives = await getUserLives(user.id);
          if (lives) {
            setCurrentLives(lives.currentLives);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleBuyWorld = async (worldId: number) => {
    if (processingId) return;

    const worldKey = `world-${worldId}` as keyof typeof WORLD_COSTS;
    const cost = WORLD_COSTS[worldKey];

    if (coins < cost) {
      alert('No tienes suficientes monedas');
      return;
    }

    setProcessingId(worldId);

    try {
      const result = await purchaseWorld(worldKey, cost);
      if (result.ok) {
        setCoins(getLocalCoins());
        setOwnedWorlds({ ...ownedWorlds, [worldId]: true });
      } else {
        alert(result.reason);
      }
    } catch (error) {
      console.error('Error en compra:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleBuyLives = async (amount: number, cost: number) => {
    if (buyingLives) return;

    if (coins < cost) {
      alert('No tienes suficientes monedas');
      return;
    }

    if (currentLives >= 5) {
      alert('Ya tienes el máximo de vidas');
      return;
    }

    setBuyingLives(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Debes iniciar sesión para comprar vidas');
        return;
      }

      const result = await buyLives(user.id, amount, cost);
      if (result.success) {
        setCoins(getLocalCoins());
        setCurrentLives(result.newLivesCount);
        alert(`¡Compraste ${amount} vida${amount > 1 ? 's' : ''}!`);
      } else {
        alert(result.error || 'Error al comprar vidas');
      }
    } catch (error) {
      console.error('Error buying lives:', error);
      alert('Error al comprar vidas');
    } finally {
      setBuyingLives(false);
    }
  };

  const ownedCount = Object.values(ownedWorlds).filter(Boolean).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-800">Tienda</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 mb-4">
          <p className="text-sm text-blue-800 font-medium">
            🗺️ Desbloquea mundos para acceder a nuevos niveles y desafíos.
          </p>
          <p className="text-xs text-blue-600 mt-1">
            💡 Al comprar un mundo, solo se desbloquea el nivel 1. Los demás niveles se desbloquean jugando.
          </p>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex items-center justify-center gap-2">
            <Coins size={20} className="text-white" />
            <span className="text-xl font-bold text-white">{coins}</span>
          </div>
          <div className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-3 flex items-center justify-center gap-2">
            <Sparkles size={20} className="text-white" />
            <span className="text-xl font-bold text-white">{ownedCount}/10</span>
          </div>
        </div>

        <button
          onClick={() => setShowCoinShop(true)}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all mb-4 flex items-center justify-center gap-2"
        >
          <ShoppingBag size={20} />
          Comprar Monedas
        </button>

        {/* Sección de Vidas */}
        <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Heart size={24} className="text-red-500" />
              <h3 className="text-lg font-bold text-gray-800">Vidas</h3>
            </div>
            <div className="bg-red-100 px-3 py-1 rounded-lg">
              <span className="text-sm font-bold text-red-600">{currentLives}/5</span>
            </div>
          </div>

          <p className="text-xs text-gray-600 mb-3">
            💡 Las vidas se regeneran automáticamente (1 vida por hora)
          </p>

          <div className="space-y-2">
            {/* 1 Vida */}
            <button
              onClick={() => handleBuyLives(1, 1000)}
              disabled={buyingLives || coins < 1000 || currentLives >= 5}
              className="w-full bg-gradient-to-r from-red-400 to-red-600 text-white py-3 rounded-lg font-semibold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between px-4"
            >
              <div className="flex items-center gap-2">
                <Heart size={18} />
                <span>1 Vida</span>
              </div>
              <div className="flex items-center gap-1">
                <Coins size={16} />
                <span>1,000</span>
              </div>
            </button>

            {/* 5 Vidas */}
            <button
              onClick={() => handleBuyLives(5, 4500)}
              disabled={buyingLives || coins < 4500 || currentLives >= 5}
              className="w-full bg-gradient-to-r from-red-500 to-red-700 text-white py-3 rounded-lg font-semibold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between px-4"
            >
              <div className="flex items-center gap-2">
                <Heart size={18} />
                <span>5 Vidas</span>
              </div>
              <div className="flex items-center gap-1">
                <Coins size={16} />
                <span className="line-through text-xs opacity-75 mr-1">5,000</span>
                <span>4,500</span>
              </div>
            </button>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-800 mb-3">Mundos</h3>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((worldId) => {
              const owned = ownedWorlds[worldId] ?? false;
              const Icon = worldIcons[worldId - 1];
              const colors = worldColors[worldId - 1];
              const worldKey = `world-${worldId}` as keyof typeof WORLD_COSTS;
              const cost = WORLD_COSTS[worldKey];

              return (
                <div
                  key={worldId}
                  className={`border-2 rounded-xl p-4 transition-all ${
                    owned ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${colors.from} ${colors.to}`}>
                      <Icon size={32} className="text-white" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">Mundo {worldId}</h3>
                        {owned && <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">Desbloqueado</span>}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{worldNames[worldId - 1]}</p>

                      {worldId === 1 && (
                        <p className="text-xs text-gray-500 italic mb-2">Gratis • 5 niveles desbloqueados</p>
                      )}
                      {worldId > 1 && !owned && (
                        <p className="text-xs text-gray-500 italic mb-2">Al comprar se desbloquea el nivel 1</p>
                      )}

                      {!owned && worldId > 1 && (
                        <div className="flex items-center gap-2 text-sm mb-1">
                          <Coins size={16} className="text-yellow-500" />
                          <span className="font-semibold">{cost}</span>
                        </div>
                      )}

                      <div className="mt-2">
                        {owned ? (
                          <div className="text-sm text-green-600 font-semibold flex items-center gap-1">
                            <Check size={16} />
                            Desbloqueado
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleBuyWorld(worldId)}
                            disabled={coins < cost || processingId === worldId}
                            className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <Lock size={16} />
                            {processingId === worldId ? 'Comprando...' : 'Desbloquear'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full bg-gray-500 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
        >
          Cerrar
        </button>
      </div>

      {showCoinShop && (
        <CoinShop
          onClose={() => {
            setShowCoinShop(false);
            setCoins(getLocalCoins());
          }}
        />
      )}
    </div>
  );
};
