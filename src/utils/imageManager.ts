// removed custom photo feature - only using predefined themes now

export const DEFAULT_IMAGES = [
  '🌟', '🎨', '🎭', '🎪', '🎯', '🎲',
  '🎸', '🎹', '🎺', '🎻', '🎼', '🎵',
  '🌈', '🌸', '🌺', '🌻', '🌼', '🌷',
  '🦋', '🐝', '🐞', '🦜', '🦚', '🦩',
  '⚽', '🏀', '🎾', '⚾', '🏐', '🏈'
];

export const getImagesForLevel = (level: number): string[] => {
  const startIndex = (level - 1) * 6;
  return DEFAULT_IMAGES.slice(startIndex, startIndex + 6);
};
