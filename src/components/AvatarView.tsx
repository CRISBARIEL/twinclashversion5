import { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { bigSmile } from '@dicebear/collection';
import { AvatarConfig } from '../types';

interface AvatarViewProps {
  config: AvatarConfig | null;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const SIZE_MAP = {
  small: 32,
  medium: 64,
  large: 96,
};

const DEFAULT_CONFIG: AvatarConfig = {
  style: 'dicebear',
  seed: 'default',
  skinColor: ['ffdbb4'],
  hairStyle: ['short01'],
  hairColor: ['2c1b18'],
  eyesStyle: ['eyes01'],
  mouthStyle: ['happy01'],
  accessoriesType: [],
  facialHairType: [],
};

export const AvatarView = ({ config, size = 'medium', className = '' }: AvatarViewProps) => {
  const avatarConfig = { ...DEFAULT_CONFIG, ...config };
  const dimension = SIZE_MAP[size];

  // Renderizar animales
  if (avatarConfig.animalId) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full shadow-inner`}
        style={{
          width: dimension,
          height: dimension,
          fontSize: `${dimension * 0.6}px`,
        }}
      >
        <span>{avatarConfig.animalId}</span>
      </div>
    );
  }

  // Generar avatar con DiceBear
  const avatarSvg = useMemo(() => {
    if (avatarConfig.style === 'dicebear' || !avatarConfig.style) {
      try {
        const avatar = createAvatar(bigSmile, {
          seed: avatarConfig.seed || 'default',
          size: dimension * 3, // Renderizar en alta resolución
          skinColor: avatarConfig.skinColor || ['ffdbb4'],
          hair: avatarConfig.hairStyle || ['short01'],
          hairColor: avatarConfig.hairColor || ['2c1b18'],
          eyes: avatarConfig.eyesStyle || ['eyes01'],
          mouth: avatarConfig.mouthStyle || ['happy01'],
          accessories: avatarConfig.accessoriesType || [],
          accessoriesColor: avatarConfig.accessoriesColor || [],
          facialHair: avatarConfig.facialHairType || [],
          facialHairColor: avatarConfig.facialHairColor || avatarConfig.hairColor || ['2c1b18'],
          clothingColor: avatarConfig.clothingColor || ['3c4f5c'],
          backgroundColor: ['ffffff'],
          backgroundType: ['solid'],
          backgroundRotation: [0],
        });

        return avatar.toString();
      } catch (error) {
        console.error('Error generating DiceBear avatar:', error);
        return null;
      }
    }

    // Retrocompatibilidad con sistema legacy
    return null;
  }, [
    avatarConfig.style,
    avatarConfig.seed,
    avatarConfig.skinColor,
    avatarConfig.hairStyle,
    avatarConfig.hairColor,
    avatarConfig.eyesStyle,
    avatarConfig.mouthStyle,
    avatarConfig.accessoriesType,
    avatarConfig.accessoriesColor,
    avatarConfig.facialHairType,
    avatarConfig.facialHairColor,
    avatarConfig.clothingColor,
    dimension,
  ]);

  // Si tenemos un avatar DiceBear, renderizarlo
  if (avatarSvg) {
    return (
      <div
        className={`${className} rounded-full overflow-hidden bg-white shadow-lg`}
        style={{
          width: dimension,
          height: dimension,
        }}
        dangerouslySetInnerHTML={{ __html: avatarSvg }}
      />
    );
  }

  // Fallback: renderizar un avatar por defecto
  return (
    <div
      className={`${className} flex items-center justify-center bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full text-white font-bold shadow-lg`}
      style={{
        width: dimension,
        height: dimension,
        fontSize: `${dimension * 0.5}px`,
      }}
    >
      ?
    </div>
  );
};
