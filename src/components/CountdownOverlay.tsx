import { useEffect, useState } from 'react';

interface CountdownOverlayProps {
  onComplete: () => void;
}

export const CountdownOverlay = ({ onComplete }: CountdownOverlayProps) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      setTimeout(onComplete, 300);
      return;
    }

    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  if (count === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-out">
        <div className="text-white text-9xl font-black animate-bounce-once">
          ¡GO!
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div
        key={count}
        className="text-white text-9xl font-black animate-scale-pulse"
      >
        {count}
      </div>
    </div>
  );
};
