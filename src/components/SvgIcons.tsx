import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  secondaryColor?: string;
}

export const BreatheIcon: React.FC<IconProps> = ({
  size = 32,
  color = '#FFFFFF',
  secondaryColor = 'rgba(255,255,255,0.4)',
}) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Concentric peaceful breathing ripples */}
    <Circle cx="16" cy="16" r="14" stroke={secondaryColor} strokeWidth="1.5" strokeDasharray="3 3" />
    <Circle cx="16" cy="16" r="10" stroke={color} strokeWidth="2" opacity={0.6} />
    <Circle cx="16" cy="16" r="6" fill={color} />
    <Path
      d="M16 6C16 11 11 16 6 16C11 16 16 21 16 26C16 21 21 16 26 16C21 16 16 11 16 6Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.8}
    />
  </Svg>
);

export const MeditateIcon: React.FC<IconProps> = ({
  size = 32,
  color = '#FFFFFF',
  secondaryColor = 'rgba(255,255,255,0.4)',
}) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Radiant halo */}
    <Circle cx="16" cy="7" r="4.5" fill={color} />
    <Circle cx="16" cy="7" r="7" stroke={secondaryColor} strokeWidth="1.5" strokeDasharray="2 3" />
    {/* Serene lotus meditation posture */}
    <Path
      d="M10 23C10 18.5 12.5 15 16 15C19.5 15 22 18.5 22 23"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <Path
      d="M6 25C9 23 12 25 16 25C20 25 23 23 26 25"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </Svg>
);

export const SoundsIcon: React.FC<IconProps> = ({
  size = 32,
  color = '#FFFFFF',
  secondaryColor = 'rgba(255,255,255,0.4)',
}) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Minimalist acoustic headphones */}
    <Path
      d="M7 17C7 12.0294 11.0294 8 16 8C20.9706 8 25 12.0294 25 17"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Left earpad */}
    <Rect x="5" y="16" width="4.5" height="8" rx="2.25" fill={color} />
    {/* Right earpad */}
    <Rect x="22.5" y="16" width="4.5" height="8" rx="2.25" fill={color} />
    {/* Sound ripple arcs */}
    <Path
      d="M12 20C13 18.5 15 18 16 18C17 18 19 18.5 20 20"
      stroke={secondaryColor}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

export const SparklesIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#F59E0B',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L14.2 8.2L20.5 10.5L14.2 12.8L12 19L9.8 12.8L3.5 10.5L9.8 8.2L12 2Z"
      fill={color}
    />
    <Path
      d="M19 17L19.9 19.1L22 20L19.9 20.9L19 23L18.1 20.9L16 20L18.1 19.1L19 17Z"
      fill={color}
      opacity={0.8}
    />
  </Svg>
);

export const LeafLogoIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 28,
  color = '#34D399',
}) => (
  <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <Path
      d="M23 5C14 5 7 12 7 21C16 21 23 14 23 5Z"
      fill={color}
      opacity={0.9}
    />
    <Path
      d="M7 21C12 16 18 10 23 5"
      stroke="#FFFFFF"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity={0.7}
    />
  </Svg>
);

