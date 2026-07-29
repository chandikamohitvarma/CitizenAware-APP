import React from 'react';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Path,
  Circle,
  Text as SvgText,
  G,
} from 'react-native-svg';

interface LogoProps {
  size?: number;
}

export function Logo({ size = 80 }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="bgGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#1D4ED8" />
          <Stop offset="1" stopColor="#0369A1" />
        </LinearGradient>
        <LinearGradient id="shieldGrad" x1="50" y1="16" x2="50" y2="70" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.28" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.06" />
        </LinearGradient>
      </Defs>

      {/* Background rounded square */}
      <Rect x="0" y="0" width="100" height="100" rx="22" fill="url(#bgGrad)" />

      {/* Inner border glow */}
      <Rect
        x="1.5"
        y="1.5"
        width="97"
        height="97"
        rx="21"
        stroke="#FFFFFF"
        strokeOpacity="0.12"
        strokeWidth="1"
        fill="none"
      />

      {/* Shield body */}
      <Path
        d="M50 15 L71 25 L71 48 Q71 65 50 74 Q29 65 29 48 L29 25 Z"
        fill="url(#shieldGrad)"
        stroke="#FFFFFF"
        strokeOpacity="0.22"
        strokeWidth="1"
      />

      {/* Horizontal accent stripe inside shield (Ashoka line reference) */}
      <Rect x="36" y="44" width="28" height="2.5" rx="1.25" fill="#FFFFFF" fillOpacity="0.35" />

      {/* CA monogram */}
      <SvgText
        x="50"
        y="60"
        fontSize="24"
        fontWeight="800"
        fill="#FFFFFF"
        textAnchor="middle"
        letterSpacing="-0.5"
      >
        CA
      </SvgText>

      {/* Top emblem dot (like a government seal) */}
      <Circle cx="50" cy="22" r="4" fill="#FFFFFF" fillOpacity="0.85" />
      <Circle cx="50" cy="22" r="2" fill="#1D4ED8" />

      {/* Tricolor bottom bar */}
      <Rect x="28" y="80" width="44" height="3" rx="1.5" fill="#FF9933" fillOpacity="0.9" />
      <Rect x="28" y="84.5" width="44" height="3" rx="1.5" fill="#FFFFFF" fillOpacity="0.9" />
      <Rect x="28" y="89" width="44" height="3" rx="1.5" fill="#138808" fillOpacity="0.9" />
    </Svg>
  );
}
