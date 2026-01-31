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
  skinColor: ['ffdbb4'],
  hairStyle: ['short01'],
  hairColor: ['2c1b18'],
  eyesStyle: ['eyes01'],
  mouthStyle: ['happy01'],
  accessoriesType: [],
  facialHairType: [],
  clothingColor: ['3c4f5c'],
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
      const avatar = createAvatar(avataaars, {
        seed: avatarConfig.seed || `user-${Date.now()}`,
        size: dimension * 2,
        skinColor: avatarConfig.skinColor,
        top: avatarConfig.hairStyle,
        hairColor: avatarConfig.hairColor,
        eyes: avatarConfig.eyesStyle,
        mouth: avatarConfig.mouthStyle,
        accessories: avatarConfig.accessoriesType,
        accessoriesColor: avatarConfig.accessoriesColor,
        facialHair: avatarConfig.facialHairType,
        facialHairColor: avatarConfig.facialHairColor || avatarConfig.hairColor,
        clothesColor: avatarConfig.clothingColor,
      });

      return avatar.toString();
    } catch (error) {
      console.error('Error generating avatar:', error);
      return null;
    }
  }, [
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
