import { useEffect, useRef } from 'react';

type ExitConfirmModalProps = {
  open: boolean;
  onStay: () => void;
  onExit: () => void;
};

export const ExitConfirmModal = ({ open, onStay, onExit }: ExitConfirmModalProps) => {
  const stayButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      stayButtonRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onStay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onStay]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-3xl font-bold text-gray-800 mb-6">
          ¿Quieres salir del nivel?
        </h3>

        <div className="space-y-3">
          <button
            ref={stayButtonRef}
            type="button"
            onClick={onStay}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            Seguir Jugando
          </button>

          <button
            type="button"
            onClick={onExit}
            className="w-full bg-gray-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  );
};
