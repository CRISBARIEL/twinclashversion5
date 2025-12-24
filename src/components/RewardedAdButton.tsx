import { useState } from 'react';
import { useAdMob } from '../hooks/useAdMob';
import { Coins, Play, Loader2 } from 'lucide-react';

interface RewardedAdButtonProps {
  onRewardGranted?: (coins: number) => void;
  onAdShown?: () => void;
  onAdFailed?: () => void;
  testMode?: boolean;
  className?: string;
}

export function RewardedAdButton({
  onRewardGranted,
  onAdShown,
  onAdFailed,
  testMode = true,
  className = ''
}: RewardedAdButtonProps) {
  const { initialized, isRewardedReady, showRewardedAd, testMode: currentTestMode } = useAdMob(true, testMode);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleClick = async () => {
    if (!initialized || isLoading) return;

    setIsLoading(true);
    setMessage('');

    try {
      const result = await showRewardedAd();

      if (result.success) {
        onAdShown?.();

        if (result.rewarded && result.coins) {
          setMessage(`+${1000} monedas ganadas!`);
          onRewardGranted?.(result.coins);

          setTimeout(() => setMessage(''), 3000);
        } else {
          setMessage('No se completó el anuncio');
          setTimeout(() => setMessage(''), 2000);
        }
      } else {
        setMessage('Error al mostrar anuncio');
        onAdFailed?.();
        setTimeout(() => setMessage(''), 2000);
      }
    } catch (error) {
      console.error('[RewardedAdButton] Error:', error);
      setMessage('Error al cargar anuncio');
      onAdFailed?.();
      setTimeout(() => setMessage(''), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <button
        onClick={handleClick}
        disabled={!initialized || !isRewardedReady || isLoading}
        className={`
          relative px-6 py-3 rounded-xl font-bold text-white
          transition-all duration-200 transform
          ${!initialized || !isRewardedReady || isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
          }
        `}
      >
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Play size={20} />
          )}
          <span>Ver Anuncio</span>
          <Coins size={20} />
        </div>

        {!isLoading && (
          <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-black px-2 py-1 rounded-full shadow-lg">
            +1000
          </div>
        )}
      </button>

      {!initialized && (
        <p className="text-xs text-gray-500">Inicializando anuncios...</p>
      )}

      {initialized && !isRewardedReady && !isLoading && (
        <p className="text-xs text-gray-500">Cargando anuncio...</p>
      )}

      {currentTestMode && initialized && (
        <p className="text-xs text-orange-500 font-semibold">MODO PRUEBA</p>
      )}

      {message && (
        <p className={`text-sm font-semibold ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
