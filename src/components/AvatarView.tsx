import { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';
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
  seed: 'default-user',
  skinColor: ['Tanned'],
  hairStyle: ['ShortHairShortFlat'],
  hairColor: ['Brown'],
  eyesStyle: ['Default'],
  mouthStyle: ['Smile'],
  accessoriesType: [],
  facialHairType: [],
  clothingColor: ['Blue02'],
};

export const AvatarView = ({ config, size = 'medium', className = '' }: AvatarViewProps) => {
  const avatarConfig = { ...DEFAULT_CONFIG, ...config };
  const dimension = SIZE_MAP[size];

  if (avatarConfig.animalId) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-100 rounded-full shadow-inner`}
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

  const avatarSvg = useMemo(() => {
    try {
      const options: any = {
        seed: avatarConfig.seed || `seed-${Date.now()}`,
        size: dimension * 4,
        backgroundColor: ['transparent'],
      };

      if (avatarConfig.skinColor?.[0]) {
        options.skinColor = avatarConfig.skinColor;
      }

      if (avatarConfig.hairStyle?.[0]) {
        options.top = avatarConfig.hairStyle;
      }

      if (avatarConfig.hairColor?.[0]) {
        options.hairColor = avatarConfig.hairColor;
      }

      if (avatarConfig.eyesStyle?.[0]) {
        options.eyes = avatarConfig.eyesStyle;
      }

      if (avatarConfig.mouthStyle?.[0]) {
        options.mouth = avatarConfig.mouthStyle;
      }

      if (avatarConfig.accessoriesType?.[0]) {
        options.accessories = avatarConfig.accessoriesType;
      }

      if (avatarConfig.accessoriesColor?.[0]) {
        options.accessoriesColor = avatarConfig.accessoriesColor;
      }

      if (avatarConfig.facialHairType?.[0]) {
        options.facialHair = avatarConfig.facialHairType;
        if (avatarConfig.facialHairColor?.[0] || avatarConfig.hairColor?.[0]) {
          options.facialHairColor = avatarConfig.facialHairColor || avatarConfig.hairColor;
        }
      }

      if (avatarConfig.clothingColor?.[0]) {
        options.clothesColor = avatarConfig.clothingColor;
      }

      console.log('🎨 Generating avatar with:', options);
      const avatar = createAvatar(avataaars, options);
      const svgString = avatar.toString();
      console.log('✅ Avatar generated successfully');
      return svgString;
    } catch (error) {
      console.error('❌ Error generating avatar:', error);
      console.error('Config was:', avatarConfig);
      return null;
    }
  }, [
    avatarConfig.seed,
    avatarConfig.skinColor?.[0],
    avatarConfig.hairStyle?.[0],
    avatarConfig.hairColor?.[0],
    avatarConfig.eyesStyle?.[0],
    avatarConfig.mouthStyle?.[0],
    avatarConfig.accessoriesType?.[0],
    avatarConfig.accessoriesColor?.[0],
    avatarConfig.facialHairType?.[0],
    avatarConfig.facialHairColor?.[0],
    avatarConfig.clothingColor?.[0],
    dimension,
  ]);

  if (avatarSvg) {
    return (
      <div
        className={`${className}`}
        style={{
          width: dimension,
          height: dimension,
          position: 'relative',
          overflow: 'visible',
        }}
        dangerouslySetInnerHTML={{ __html: avatarSvg }}
      />
    );
  }

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
