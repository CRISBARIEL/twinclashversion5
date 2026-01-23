import { useState } from 'react';
import { X, ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import { reviewService, FeedbackData } from '../lib/reviewService';
import toast from 'react-hot-toast';

interface SatisfactionModalProps {
  onPositive: () => void;
  onNegative: () => void;
  onClose: () => void;
}

export function SatisfactionModal({ onPositive, onNegative, onClose }: SatisfactionModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-700 animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">¿Te está gustando Twin Clash?</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={onPositive}
            className="flex-1 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-6 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 flex flex-col items-center gap-3 shadow-lg"
          >
            <ThumbsUp className="w-12 h-12" />
            <span>Sí, me encanta</span>
          </button>

          <button
            onClick={onNegative}
            className="flex-1 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-6 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 flex flex-col items-center gap-3 shadow-lg"
          >
            <ThumbsDown className="w-12 h-12" />
            <span>No mucho</span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface ReviewRequestModalProps {
  onReview: () => void;
  onLater: () => void;
  onClose: () => void;
}

export function ReviewRequestModal({ onReview, onLater, onClose }: ReviewRequestModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-700 animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">¡Genial!</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6 text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-8 h-8 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-slate-200 text-lg">
            ¿Nos dejas una reseña en Google Play?
          </p>
          <p className="text-slate-400 text-sm mt-2">
            Tardarás 10 segundos y nos ayudarás muchísimo
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onReview}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Valorar ahora
          </button>

          <button
            onClick={onLater}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 px-6 rounded-xl font-medium transition-colors"
          >
            Más tarde
          </button>
        </div>
      </div>
    </div>
  );
}

interface FeedbackModalProps {
  onClose: () => void;
}

export function FeedbackModal({ onClose }: FeedbackModalProps) {
  const [selectedType, setSelectedType] = useState<FeedbackData['feedback_type'] | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackOptions = [
    { type: 'performance' as const, label: 'Lag / Rendimiento', emoji: '⚡' },
    { type: 'difficulty' as const, label: 'Dificultad / Tiempo', emoji: '🎯' },
    { type: 'monetization' as const, label: 'Anuncios / Monedas', emoji: '💰' },
    { type: 'other' as const, label: 'Otro', emoji: '💬' },
  ];

  const handleSubmit = async () => {
    if (!selectedType) {
      toast.error('Por favor selecciona una opción');
      return;
    }

    setIsSubmitting(true);

    try {
      await reviewService.saveFeedback({
        feedback_type: selectedType,
        feedback_text: feedbackText,
      });

      toast.success('¡Gracias por tu feedback! Lo revisaremos pronto');
      onClose();
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast.error('Error al enviar feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-700 animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">¿Qué podemos mejorar?</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-slate-300 mb-6">
          Tu opinión es muy importante para nosotros. Cuéntanos qué no te gustó:
        </p>

        <div className="space-y-3 mb-6">
          {feedbackOptions.map((option) => (
            <button
              key={option.type}
              onClick={() => setSelectedType(option.type)}
              className={`w-full p-4 rounded-xl font-medium text-left transition-all flex items-center gap-3 ${
                selectedType === option.type
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              }`}
            >
              <span className="text-2xl">{option.emoji}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        <div className="mb-6">
          <label className="block text-slate-300 mb-2 font-medium">
            Cuéntanos más (opcional):
          </label>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Escribe aquí tus comentarios..."
            className="w-full bg-slate-700 text-white rounded-xl p-4 border border-slate-600 focus:border-blue-500 focus:outline-none resize-none"
            rows={4}
            maxLength={500}
          />
          <div className="text-right text-slate-400 text-sm mt-1">
            {feedbackText.length}/500
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedType}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-lg"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar feedback'}
        </button>
      </div>
    </div>
  );
}
