import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  shareText: string;
  shareUrl: string;
}

export const ShareModal = ({ open, onClose, shareText, shareUrl }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    window.open(url, '_blank');
  };

  const handleTikTok = () => {
    window.open('https://www.tiktok.com/', '_blank');
  };

  const handleInstagram = () => {
    window.open('https://www.instagram.com/', '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TwinClash',
          text: shareText,
          url: shareUrl,
        });
        onClose();
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Compartir</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-white text-2xl">
              💬
            </div>
            <span className="text-xs font-semibold text-gray-700">WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleInstagram}
            className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white text-2xl">
              📷
            </div>
            <span className="text-xs font-semibold text-gray-700">Instagram</span>
          </button>

          <button
            type="button"
            onClick={handleTikTok}
            className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center text-white text-2xl">
              🎵
            </div>
            <span className="text-xs font-semibold text-gray-700">TikTok</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleCopyLink}
          className="w-full bg-blue-500 text-white py-4 rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 mb-3"
        >
          {copied ? (
            <>
              <Check size={20} />
              ¡Copiado!
            </>
          ) : (
            <>
              <Copy size={20} />
              Copiar enlace
            </>
          )}
        </button>

        {navigator.share && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full bg-gray-500 text-white py-4 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
          >
            Más opciones...
          </button>
        )}
      </div>
    </div>
  );
};
