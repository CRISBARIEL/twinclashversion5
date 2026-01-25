import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { getUserLives, getTimeUntilNextLife, formatTimeUntilNextLife, UserLives } from '../lib/progressionService';
import { supabase } from '../lib/supabase';

export const LivesDisplay = () => {
  const [lives, setLives] = useState<UserLives | null>(null);
  const [timeUntilNext, setTimeUntilNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLives();
    const interval = setInterval(loadLives, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadLives = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const userLives = await getUserLives(user.id);
    setLives(userLives);
    setLoading(false);

    if (userLives && userLives.currentLives < userLives.maxLives) {
      const ms = getTimeUntilNextLife(userLives);
      if (ms) {
        setTimeUntilNext(formatTimeUntilNextLife(ms));
      }
    } else {
      setTimeUntilNext(null);
    }
  };

  if (loading || !lives) return null;

  return (
    <div className="flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-pink-600 rounded-full px-3 py-1.5 shadow-lg">
      <div className="flex gap-0.5">
        {Array.from({ length: lives.maxLives }).map((_, i) => (
          <Heart
            key={i}
            size={16}
            className={`${
              i < lives.currentLives
                ? 'text-white fill-white'
                : 'text-white/30 fill-transparent'
            } transition-all`}
          />
        ))}
      </div>
      {timeUntilNext && lives.currentLives < lives.maxLives && (
        <div className="text-white text-xs font-bold ml-1">
          {timeUntilNext}
        </div>
      )}
    </div>
  );
};
