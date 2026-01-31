import Avatar from 'boring-avatars';
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

const DEFAULT_COLORS = ['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90'];

export const AvatarView = ({ config, size = 'medium', className = '' }: AvatarViewProps) => {
  const dimension = SIZE_MAP[size];

  const variant = (config?.style as 'marble' | 'beam' | 'pixel' | 'sunset' | 'ring' | 'bauhaus') || 'marble';
  const name = config?.seed || 'Player';
  const colors = config?.colors || DEFAULT_COLORS;

  return (
    <div className={className}>
      <Avatar
        size={dimension}
        name={name}
        variant={variant}
        colors={colors}
      />
    </div>
  );
};
