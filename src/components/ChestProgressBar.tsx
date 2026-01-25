import { useState, useEffect } from 'react';
import { Gift } from 'lucide-react';
import { getChestProgress, ChestProgress } from '../lib/progressionService';
import { supabase } from '../lib/supabase';

export const ChestProgressBar = () => {
  const [progress, setProgress] = useState<ChestProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const chestProgress = await getChestProgress(user.id);
    setProgress(chestProgress);
    setLoading(false);
  };

  if (loading || !progress) return null;

  const progressPercent = (progress.progress / 3) * 100;

  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full px-4 py-2 shadow-lg">
      <Gift className="w-5 h-5 text-white" />
      <div className="flex-1 bg-white/30 rounded-full h-2 w-24 overflow-hidden">
        <div
          className="h-full bg-white transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <span className="text-white font-bold text-sm">{progress.progress}/3</span>
    </div>
  );
};
