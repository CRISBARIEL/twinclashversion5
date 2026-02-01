import { createAvatar } from '@dicebear/core';
import { adventurer, adventurerNeutral, avataaars, bigEars, lorelei, micah, personas } from '@dicebear/collection';
import { AvatarConfig } from '../types';
import { useMemo } from 'react';

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

const STYLE_MAP = {
  adventurer,
  'adventurer-neutral': adventurerNeutral,
  avataaars,
  'big-ears': bigEars,
  lorelei,
  micah,
  personas,
};

export const AvatarView = ({ config, size = 'medium', className = '' }: AvatarViewProps) => {
  const dimension = SIZE_MAP[size];

  const avatarSvg = useMemo(() => {
    const style = (config?.style || 'adventurer') as keyof typeof STYLE_MAP;
    const seed = config?.seed || 'Player';

    const avatar = createAvatar(STYLE_MAP[style] || adventurer, {
      seed,
      size: dimension,
    });

    return avatar.toString();
  }, [config?.style, config?.seed, dimension]);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: avatarSvg }}
    />
  );
};
