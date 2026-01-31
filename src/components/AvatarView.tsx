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

const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
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
  const dimension = SIZE_MAP[size];
  const mergedConfig = { ...DEFAULT_AVATAR_CONFIG, ...config };

  if (mergedConfig.animalId) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-100 rounded-full shadow-inner`}
        style={{
          width: dimension,
          height: dimension,
          fontSize: `${dimension * 0.6}px`,
        }}
      >
        <span>{mergedConfig.animalId}</span>
      </div>
    );
  }

  const avatarSvg = useMemo(() => {
    try {
      const options: any = {
        seed: mergedConfig.seed || `user-${Date.now()}`,
        size: 256,
      };

      if (mergedConfig.skinColor?.length && mergedConfig.skinColor[0]) {
        options.skinColor = mergedConfig.skinColor;
      }

      if (mergedConfig.hairStyle?.length && mergedConfig.hairStyle[0]) {
        options.top = mergedConfig.hairStyle;
      }

      if (mergedConfig.hairColor?.length && mergedConfig.hairColor[0]) {
        options.hairColor = mergedConfig.hairColor;
      }

      if (mergedConfig.eyesStyle?.length && mergedConfig.eyesStyle[0]) {
        options.eyes = mergedConfig.eyesStyle;
      }

      if (mergedConfig.mouthStyle?.length && mergedConfig.mouthStyle[0]) {
        options.mouth = mergedConfig.mouthStyle;
      }

      if (mergedConfig.accessoriesType?.length && mergedConfig.accessoriesType[0]) {
        options.accessories = mergedConfig.accessoriesType;
      }

      if (mergedConfig.accessoriesColor?.length && mergedConfig.accessoriesColor[0]) {
        options.accessoriesColor = mergedConfig.accessoriesColor;
      }

      if (mergedConfig.facialHairType?.length && mergedConfig.facialHairType[0]) {
        options.facialHair = mergedConfig.facialHairType;
        const fhColor = mergedConfig.facialHairColor || mergedConfig.hairColor;
        if (fhColor?.length && fhColor[0]) {
          options.facialHairColor = fhColor;
        }
      }

      if (mergedConfig.clothingColor?.length && mergedConfig.clothingColor[0]) {
        options.clothesColor = mergedConfig.clothingColor;
      }

      const avatar = createAvatar(avataaars, options);
      return avatar.toString();
    } catch (error) {
      console.error('Error generating avatar:', error);
      return null;
    }
  }, [
    mergedConfig.seed,
    mergedConfig.skinColor?.[0],
    mergedConfig.hairStyle?.[0],
    mergedConfig.hairColor?.[0],
    mergedConfig.eyesStyle?.[0],
    mergedConfig.mouthStyle?.[0],
    mergedConfig.accessoriesType?.[0],
    mergedConfig.accessoriesColor?.[0],
    mergedConfig.facialHairType?.[0],
    mergedConfig.facialHairColor?.[0],
    mergedConfig.clothingColor?.[0],
  ]);

  if (avatarSvg) {
    return (
      <div
        className={`${className}`}
        style={{
          width: dimension,
          height: dimension,
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
