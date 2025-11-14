import { useCallback, useEffect, useState } from 'react';
import Particles from 'react-tsparticles';
import type { Engine } from 'tsparticles-engine';
import { loadSlim } from '@tsparticles/slim';

export type ShatterTheme = 'ice' | 'stone' | 'chocolate';

interface ShatterEffectProps {
  trigger: boolean;
  theme: ShatterTheme;
  onComplete?: () => void;
}

const themeColors: Record<ShatterTheme, string[]> = {
  ice: ['#00d4ff', '#0099cc', '#66e0ff', '#3399ff'],
  stone: ['#8b6f47', '#a0826d', '#6b5c4d', '#8b7355'],
  chocolate: ['#d2691e', '#ff8c42', '#ff6f3c', '#ffa500']
};

export const ShatterEffect = ({ trigger, theme, onComplete }: ShatterEffectProps) => {
  const [showParticles, setShowParticles] = useState(false);
  const [particleKey, setParticleKey] = useState(0);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  useEffect(() => {
    if (trigger) {
      setShowParticles(true);
      setParticleKey(prev => prev + 1);

      const timer = setTimeout(() => {
        setShowParticles(false);
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  if (!showParticles) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <Particles
        key={particleKey}
        id={`shatter-${theme}-${particleKey}`}
        init={particlesInit}
        options={{
          particles: {
            number: {
              value: 30
            },
            color: {
              value: themeColors[theme]
            },
            shape: {
              type: ['circle', 'square']
            },
            opacity: {
              value: { min: 0.3, max: 1 },
              animation: {
                enable: true,
                speed: 1,
                minimumValue: 0,
                sync: false,
                destroy: 'min'
              }
            },
            size: {
              value: { min: 3, max: 8 }
            },
            move: {
              enable: true,
              speed: { min: 3, max: 8 },
              direction: 'none',
              random: true,
              straight: false,
              outModes: {
                default: 'destroy'
              },
              gravity: {
                enable: true,
                acceleration: 9.81
              }
            },
            rotate: {
              value: { min: 0, max: 360 },
              animation: {
                enable: true,
                speed: 30,
                sync: false
              }
            },
            life: {
              duration: {
                value: 2
              }
            }
          },
          emitters: {
            position: {
              x: 50,
              y: 50
            },
            rate: {
              quantity: 30,
              delay: 0
            },
            life: {
              duration: 0.1,
              count: 1
            }
          },
          detectRetina: true
        }}
      />
    </div>
  );
};
