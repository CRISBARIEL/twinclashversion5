import { useEffect, useState, useRef } from 'react';
import { Settings } from 'lucide-react';
import { soundManager } from '../lib/sound';

export const SoundGear = () => {
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [vol, setVol] = useState(1);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const m = localStorage.getItem('sound.muted');
    const v = localStorage.getItem('sound.volume');
    const initMuted = m === 'true';
    const initVol = v ? Math.max(0, Math.min(1, parseFloat(v))) : 1;
    setMuted(initMuted);
    setVol(initVol);

    try {
      if (initMuted) {
        soundManager.mute();
      } else {
        soundManager.unmute();
      }
      soundManager.setMasterVolume(initVol);
    } catch (error) {
      console.error('Error initializing sound:', error);
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    localStorage.setItem('sound.muted', next ? 'true' : 'false');
    try {
      if (next) {
        soundManager.mute();
      } else {
        soundManager.unmute();
      }
    } catch (error) {
      console.error('Error toggling sound:', error);
    }
  };

  const onVol = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value) / 100;
    setVol(value);
    localStorage.setItem('sound.volume', String(value));
    try {
      soundManager.setMasterVolume(value);
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };

  return (
    <div className="relative select-none" ref={menuRef}>
      <button
        type="button"
        aria-label="Ajustes de sonido"
        onClick={() => setOpen(o => !o)}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Settings size={20} className="text-gray-700" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 rounded-xl shadow-2xl bg-white p-4 z-50 min-w-[200px]">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-sm font-semibold text-gray-700">Sonido</span>
            <button
              type="button"
              onClick={toggle}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                muted
                  ? 'bg-gray-200 text-gray-600'
                  : 'bg-green-500 text-white'
              }`}
            >
              {muted ? 'OFF' : 'ON'}
            </button>
          </div>
          <div className="mt-2">
            <label className="text-xs text-gray-600 block mb-1">
              Volumen: {Math.round(vol * 100)}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(vol * 100)}
              onChange={onVol}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              disabled={muted}
            />
          </div>
        </div>
      )}
    </div>
  );
};
