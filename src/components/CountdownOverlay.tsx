import { useEffect, useState } from 'react';

interface CountdownOverlayProps {
  initialCount: number;
  onComplete: () => void;
}

export const CountdownOverlay = ({ initialCount, onComplete }: CountdownOverlayProps) => {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    if (count === 0) {
      setTimeout(onComplete, 100);
      return;
    }

    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
      <div
        key={count}
        className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl px-8 py-4 shadow-2xl animate-scale-pulse"
      >
        <div className="text-7xl font-black">
          {count}
        </div>
      </div>
    </div>
  );
};
