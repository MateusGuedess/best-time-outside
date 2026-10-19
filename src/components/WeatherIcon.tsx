import Svg, { Circle, G, Path } from "react-native-svg";

import type { WeatherKind } from "@/recommendation/weatherKind";
import { usePeriodColors } from "@/theme/PeriodTheme";
import type { Period } from "@/types/recommendation";

const CLOUD = "M 7 17 H 17 A 4 4 0 0 0 17.5 9.03 A 5.5 5.5 0 0 0 7.2 10.5 A 3.25 3.25 0 0 0 7 17 Z";

const SUN_RAYS = Array.from({ length: 8 }, (_, index) => (index * Math.PI) / 4);

function Sun({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <G>
      <Circle cx={cx} cy={cy} r={r} />
      {SUN_RAYS.map((angle) => (
        <Path
          key={angle}
          d={`M ${cx + Math.cos(angle) * (r + 2)} ${cy + Math.sin(angle) * (r + 2)} L ${cx + Math.cos(angle) * (r + 4)} ${cy + Math.sin(angle) * (r + 4)}`}
        />
      ))}
    </G>
  );
}

function Moon() {
  return <Path d="M 15 4 A 8.5 8.5 0 1 0 20 17 A 7 7 0 0 1 15 4 Z" />;
}

type WeatherIconProps = {
  kind: WeatherKind;
  period: Period;
  size?: number;
};

export function WeatherIcon({ kind, period, size = 26 }: WeatherIconProps) {
  const colors = usePeriodColors();
  const cloud = <Path d={CLOUD} fill={colors.background} />;

  const glyphs: Record<WeatherKind, React.JSX.Element> = {
    clear: period === "day" ? <Sun cx={12} cy={12} r={4} /> : <Moon />,
    partly: (
      <>
        <G transform="translate(-2 -3) scale(0.75)">
          {period === "day" ? <Sun cx={12} cy={12} r={4} /> : <Moon />}
        </G>
        <G transform="translate(1 2)">{cloud}</G>
      </>
    ),
    cloudy: cloud,
    rain: (
      <>
        <G transform="translate(0 -3)">{cloud}</G>
        <Path d="M 9 17 l -1 3 M 12.5 17 l -1 3 M 16 17 l -1 3" />
      </>
    ),
    storm: (
      <>
        <G transform="translate(0 -3)">{cloud}</G>
        <Path d="M 12.5 15 L 10.5 18.5 H 13 L 11 22" />
      </>
    ),
  };

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.text}
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {glyphs[kind]}
    </Svg>
  );
}
