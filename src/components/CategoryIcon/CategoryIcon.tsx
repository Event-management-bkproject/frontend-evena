import React from 'react';
import {
  Event,
  MusicNote,
  Sports,
  Restaurant,
  LocalMovies,
  TheaterComedy,
  Brush,
  School,
  Business,
  LocalHospital,
  ShoppingCart,
  FitnessCenter,
  Psychology,
  Celebration,
  Castle,
  Nightlife,
  LiveTv,
  SportsEsports,
  Campaign,
  Festival,
  Mic,
  Museum,
  Park,
  BeachAccess,
  Hiking,
  EmojiEvents,
  Explore,
  LocalLibrary,
  Science,
  Category as DefaultIcon,
} from '@mui/icons-material';
import { SvgIconProps } from '@mui/material';

interface CategoryIconProps extends SvgIconProps {
  iconName?: string;
}

// Map of icon names to components — exported so other components can check membership
export const ICON_MAP: Record<string, React.ComponentType<SvgIconProps>> = {
  Event,
  MusicNote,
  Sports,
  Restaurant,
  LocalMovies,
  TheaterComedy,
  Brush,
  School,
  Business,
  LocalHospital,
  ShoppingCart,
  FitnessCenter,
  Psychology,
  Celebration,
  Castle,
  Nightlife,
  LiveTv,
  SportsEsports,
  Campaign,
  Festival,
  Mic,
  Museum,
  Park,
  BeachAccess,
  Hiking,
  EmojiEvents,
  Explore,
  LocalLibrary,
  Science,
};

/**
 * CategoryIcon component
 * Renders a Material-UI icon based on the iconName prop
 * Falls back to DefaultIcon if iconName is not found
 *
 * @example
 * <CategoryIcon iconName="MusicNote" fontSize="large" color="primary" />
 */
export const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, ...props }) => {
  const IconComponent = iconName && ICON_MAP[iconName] ? ICON_MAP[iconName] : DefaultIcon;
  return <IconComponent {...props} />;
};

export default CategoryIcon;
