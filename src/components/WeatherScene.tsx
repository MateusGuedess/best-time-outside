import { useMemo } from "react";
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

import type { Scene } from "@/recommendation/weatherKind";
import { usePeriodColors } from "@/theme/PeriodTheme";

import { seaLines } from "./seaLines";
import type { Crossing, FlockMember } from "./birdShape";
import { Birds, CrossingFlock, RainCloud, Sea, WindGusts, type BirdSpec } from "./sceneMotion";

const ART_WIDTH = 320;
const ART_TOP = 18;
const ART_HEIGHT = 212;
const ART_MAX_WIDTH = 340;
const ART_GUTTER = 32;
const SEA_OVERFLOW = 12;
const DISC = { cx: 160, cy: 132, r: 84 };
const HORIZON = DISC.cy + 6;
const REFLECTION_REACH = DISC.r * 1.45;
const CLOUD_LIFT = -44;

const SUN_BIRDS: BirdSpec[] = [
  { x: 214, y: 34, scale: 1, phase: 0 },
  { x: 236, y: 48, scale: 0.8, phase: 0.31 },
  { x: 196, y: 56, scale: 0.9, phase: 0.62 },
  { x: 252, y: 30, scale: 0.7, phase: 0.17 },
  { x: 226, y: 70, scale: 0.6, phase: 0.83 },
];

const MOON_FLOCK: FlockMember[] = [
  { dx: 12, dy: -6, scale: 1.25, speed: 1, flapPhase: 0, wave: 0, waveCycles: 0, climb: 0 },
  { dx: 24, dy: 8, scale: 1.1, speed: 0.95, flapPhase: 0.3, wave: 7, waveCycles: 1, climb: 0 },
  {
    dx: -12,
    dy: -2,
    scale: 1.05,
    speed: 1.05,
    flapPhase: 0.55,
    wave: 0,
    waveCycles: 0,
    climb: -16,
  },
  { dx: -2, dy: 16, scale: 0.95, speed: 0.98, flapPhase: 0.8, wave: 4, waveCycles: 2, climb: 8 },
];

const MOON_CROSSING: Crossing = {
  fromX: DISC.cx - DISC.r - 30,
  toX: DISC.cx + DISC.r + 30,
  y: 88,
  shrink: 0.65,
};

const SEA_LINES = seaLines(HORIZON + 2, ART_HEIGHT);

type Bounds = { x: number; width: number };

function SeaGradient({ id, color }: { id: string; color: string }) {
  return (
    <LinearGradient
      id={id}
      gradientUnits="userSpaceOnUse"
      x1={DISC.cx - REFLECTION_REACH}
      y1={0}
      x2={DISC.cx + REFLECTION_REACH}
      y2={0}
    >
      <Stop offset="0" stopColor={color} stopOpacity={0} />
      <Stop offset="0.18" stopColor={color} stopOpacity={0.35} />
      <Stop offset="0.33" stopColor={color} stopOpacity={1} />
      <Stop offset="0.67" stopColor={color} stopOpacity={1} />
      <Stop offset="0.82" stopColor={color} stopOpacity={0.35} />
      <Stop offset="1" stopColor={color} stopOpacity={0} />
    </LinearGradient>
  );
}

function Reflection({ sea, bounds }: { sea: string; bounds: Bounds }) {
  return (
    <Sea
      lines={SEA_LINES}
      x={bounds.x - SEA_OVERFLOW}
      width={bounds.width + SEA_OVERFLOW * 2}
      fill={`url(#${sea})`}
    />
  );
}

function SmallCloud({ fill, stroke }: { fill: string; stroke: string }) {
  return (
    <G
      transform={`translate(0 ${CLOUD_LIFT})`}
      stroke={stroke}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path
        fill={fill}
        d="M 62 182 H 136 A 13 13 0 0 0 128 158 A 17 17 0 0 0 98 152 A 13 13 0 0 0 74 164 A 9 9 0 0 0 62 182 Z"
      />
      <Path fill="none" d="M 104 170 a 6 6 0 1 1 6 -6 a 11 11 0 0 0 -11 -11" />
      <Path fill="none" d="M 80 174 a 4 4 0 1 1 4 -4" />
    </G>
  );
}

const RAIN_CLOUD_PLACEMENT = "translate(18 33) scale(0.518)";
const DIMMED_OPACITY = 0.55;

function SceneArt({ scene, bounds }: { scene: Scene; bounds: Bounds }) {
  const colors = usePeriodColors();
  const isDay = scene.body === "sun";
  const isClear = scene.sky === "clear";
  const disc = isDay ? colors.sun : colors.moon;

  return (
    <>
      <Defs>
        <LinearGradient id="discShade" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={isDay ? colors.sun : colors.moonShade} />
          <Stop offset="0.45" stopColor={disc} />
        </LinearGradient>
        <SeaGradient id="sea" color={disc} />
        <RadialGradient id="flash" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor={colors.flash} stopOpacity={1} />
          <Stop offset="1" stopColor={colors.flash} stopOpacity={0} />
        </RadialGradient>
        <ClipPath id="disc">
          <Circle {...DISC} />
        </ClipPath>
        <ClipPath id="sky">
          <Rect x={0} y={0} width={ART_WIDTH} height={HORIZON} />
        </ClipPath>
      </Defs>

      <G opacity={isClear ? 1 : DIMMED_OPACITY}>
        <G clipPath="url(#sky)">
          <Circle {...DISC} fill="url(#discShade)" />
          {!isDay && isClear && (
            <G clipPath="url(#disc)">
              <CrossingFlock
                flock={MOON_FLOCK}
                crossing={MOON_CROSSING}
                color={colors.background}
              />
            </G>
          )}
        </G>
        <Reflection sea="sea" bounds={bounds} />
      </G>

      {isClear ? (
        <SmallCloud fill={colors.background} stroke={isDay ? colors.sun : colors.moonShade} />
      ) : (
        <G transform={RAIN_CLOUD_PLACEMENT}>
          <RainCloud
            storm={scene.sky === "storm"}
            cloud={colors.cloud}
            background={colors.background}
            flashId="flash"
          />
        </G>
      )}

      {isDay && isClear && <Birds birds={SUN_BIRDS} color={colors.text} />}

      {scene.wind !== "light" && (
        <WindGusts
          strength={scene.wind}
          fromX={bounds.x}
          toX={bounds.x + bounds.width}
          color={colors.text}
        />
      )}
    </>
  );
}

type WeatherSceneProps = {
  scene: Scene;
  width: number;
};

export function WeatherScene({ scene, width }: WeatherSceneProps) {
  const { scale, bounds } = useMemo(() => {
    const artScale = Math.min(width - ART_GUTTER, ART_MAX_WIDTH) / ART_WIDTH;
    const viewWidth = width / artScale;
    return { scale: artScale, bounds: { x: (ART_WIDTH - viewWidth) / 2, width: viewWidth } };
  }, [width]);

  return (
    <Svg
      width={width}
      height={(ART_HEIGHT - ART_TOP) * scale}
      viewBox={`${bounds.x} ${ART_TOP} ${bounds.width} ${ART_HEIGHT - ART_TOP}`}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <SceneArt scene={scene} bounds={bounds} />
    </Svg>
  );
}
