import { useEffect } from "react";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { Ellipse, G, Path, Rect } from "react-native-svg";

import {
  birdPath,
  flockPosition,
  WING_DOWN,
  WING_UP,
  type Crossing,
  type FlockMember,
} from "./birdShape";
import {
  boltPath,
  cloudPath,
  dropFrame,
  DROPS,
  flashIntensity,
  swirlPath,
  type Drop,
} from "./rainShape";
import type { SeaLine } from "./seaLines";
import { gustFrame, GUST_LOOP_MS, GUSTS, type Gust, type WindStrength } from "./windShape";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

const TWO_PI = Math.PI * 2;
const WING_MIDDLE = (WING_UP + WING_DOWN) / 2;
const WING_RANGE = (WING_DOWN - WING_UP) / 2;

const PERCHED_LOOP_MS = 4000;
const PERCHED_FLAPS = 5;
const WATER_LOOP_MS = 5000;
const FLOCK_LOOP_MS = 18000;
const FLOCK_FLAPS = 28;

export function useLoop(durationMs: number): SharedValue<number> {
  const progress = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    progress.set(withRepeat(withTiming(1, { duration: durationMs, easing: Easing.linear }), -1));
    return () => cancelAnimation(progress);
  }, [durationMs, progress, reduceMotion]);

  return progress;
}

function wingLift(cycles: number, phase: number): number {
  "worklet";
  return WING_MIDDLE + Math.sin((cycles + phase) * TWO_PI) * WING_RANGE;
}

export type BirdSpec = { x: number; y: number; scale: number; phase: number };

function FlappingBird({
  x,
  y,
  scale,
  phase,
  progress,
}: BirdSpec & { progress: SharedValue<number> }) {
  const animatedProps = useAnimatedProps(() => {
    const bob = Math.sin((progress.get() + phase) * TWO_PI) * 1.5;
    return { d: birdPath(x, y + bob, scale, wingLift(progress.get() * PERCHED_FLAPS, phase), 1) };
  });

  return <AnimatedPath animatedProps={animatedProps} d={birdPath(x, y, scale, WING_UP, 1)} />;
}

export function Birds({ birds, color }: { birds: readonly BirdSpec[]; color: string }) {
  const progress = useLoop(PERCHED_LOOP_MS);
  return (
    <G fill={color}>
      {birds.map((bird) => (
        <FlappingBird key={`${bird.x}-${bird.y}`} {...bird} progress={progress} />
      ))}
    </G>
  );
}

const GLOW_SPREAD = 3.2;
const GLOW_OPACITY = 0.28;

function Wave({
  line,
  index,
  x,
  width,
  fill,
  progress,
}: {
  line: SeaLine;
  index: number;
  x: number;
  width: number;
  fill: string;
  progress: SharedValue<number>;
}) {
  const coreProps = useAnimatedProps(() => ({
    x: x + Math.sin((progress.get() + index * 0.07) * TWO_PI) * line.drift,
    height: line.height * (1 + Math.sin((progress.get() + index * 0.11) * TWO_PI * 2) * 0.2),
  }));
  const glowProps = useAnimatedProps(() => ({
    x: x + Math.sin((progress.get() + index * 0.07) * TWO_PI) * line.drift,
  }));

  return (
    <>
      <AnimatedRect
        animatedProps={glowProps}
        x={x}
        y={line.y - line.height * 1.1}
        width={width}
        height={line.height * GLOW_SPREAD}
        rx={(line.height * GLOW_SPREAD) / 2}
        fill={fill}
        opacity={line.opacity * GLOW_OPACITY}
      />
      <AnimatedRect
        animatedProps={coreProps}
        x={x}
        y={line.y}
        width={width}
        height={line.height}
        rx={line.height / 2}
        fill={fill}
        opacity={line.opacity}
      />
    </>
  );
}

export function Sea({
  lines,
  x,
  width,
  fill,
}: {
  lines: readonly SeaLine[];
  x: number;
  width: number;
  fill: string;
}) {
  const progress = useLoop(WATER_LOOP_MS);
  return (
    <>
      {lines.map((line, index) => (
        <Wave
          key={line.y}
          line={line}
          index={index}
          x={x}
          width={width}
          fill={fill}
          progress={progress}
        />
      ))}
    </>
  );
}

function FlockBird({
  member,
  crossing,
  progress,
}: {
  member: FlockMember;
  crossing: Crossing;
  progress: SharedValue<number>;
}) {
  const animatedProps = useAnimatedProps(() => {
    const position = flockPosition(member, crossing, progress.get());
    const lift = wingLift(progress.get() * FLOCK_FLAPS, member.flapPhase);
    return { d: birdPath(position.x, position.y, position.scale, lift, position.direction) };
  });

  return (
    <AnimatedPath
      animatedProps={animatedProps}
      d={birdPath(crossing.fromX, crossing.y, member.scale, WING_UP, 1)}
    />
  );
}

export function CrossingFlock({
  flock,
  crossing,
  color,
}: {
  flock: readonly FlockMember[];
  crossing: Crossing;
  color: string;
}) {
  const progress = useLoop(FLOCK_LOOP_MS);
  return (
    <G fill={color}>
      {flock.map((member) => (
        <FlockBird
          key={`${member.dx}-${member.dy}`}
          member={member}
          crossing={crossing}
          progress={progress}
        />
      ))}
    </G>
  );
}

const CLOUD_DRIFT_MS = 7000;
const CLOUD_DRIFT = 6;
const RAIN_LOOP_MS = 1100;
const FLASH_LOOP_MS = 4500;
const GLOW = { cx: 176, cy: 104, rx: 130, ry: 78 };

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

function RainDrop({
  drop,
  color,
  drift,
  rain,
}: {
  drop: Drop;
  color: string;
  drift: SharedValue<number>;
  rain: SharedValue<number>;
}) {
  const animatedProps = useAnimatedProps(() =>
    dropFrame(drop, Math.sin(drift.get() * TWO_PI) * CLOUD_DRIFT, rain.get()),
  );

  return (
    <AnimatedPath
      animatedProps={animatedProps}
      d={dropFrame(drop, 0, drop.phase).d}
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
    />
  );
}

export function RainCloud({
  storm,
  cloud,
  background,
  flashId,
}: {
  storm: boolean;
  cloud: string;
  background: string;
  flashId: string;
}) {
  const drift = useLoop(CLOUD_DRIFT_MS);
  const rain = useLoop(RAIN_LOOP_MS);
  const flash = useLoop(FLASH_LOOP_MS);

  const cloudProps = useAnimatedProps(() => ({
    d: cloudPath(Math.sin(drift.get() * TWO_PI) * CLOUD_DRIFT),
  }));
  const swirlProps = useAnimatedProps(() => ({
    d: swirlPath(Math.sin(drift.get() * TWO_PI) * CLOUD_DRIFT),
  }));
  const boltProps = useAnimatedProps(() => ({
    d: boltPath(Math.sin(drift.get() * TWO_PI) * CLOUD_DRIFT),
  }));
  const glowProps = useAnimatedProps(() => ({
    cx: GLOW.cx + Math.sin(drift.get() * TWO_PI) * CLOUD_DRIFT,
    opacity: flashIntensity(flash.get()),
  }));

  return (
    <>
      {storm && (
        <AnimatedEllipse
          animatedProps={glowProps}
          cx={GLOW.cx}
          cy={GLOW.cy}
          rx={GLOW.rx}
          ry={GLOW.ry}
          fill={`url(#${flashId})`}
          opacity={0}
        />
      )}
      <AnimatedPath animatedProps={cloudProps} d={cloudPath(0)} fill={cloud} />
      <AnimatedPath
        animatedProps={swirlProps}
        d={swirlPath(0)}
        fill="none"
        stroke={background}
        strokeWidth={3.6}
        strokeLinecap="round"
      />
      {storm && <AnimatedPath animatedProps={boltProps} d={boltPath(0)} fill={background} />}
      {DROPS.map((drop) => (
        <RainDrop key={drop.x} drop={drop} color={cloud} drift={drift} rain={rain} />
      ))}
    </>
  );
}

const GUST_OPACITY = 0.7;

function WindGust({
  gust,
  fromX,
  toX,
  color,
  progress,
}: {
  gust: Gust;
  fromX: number;
  toX: number;
  color: string;
  progress: SharedValue<number>;
}) {
  const animatedProps = useAnimatedProps(() => {
    const frame = gustFrame(gust, fromX, toX, progress.get());
    return { d: frame.d, opacity: frame.opacity * GUST_OPACITY };
  });

  return (
    <AnimatedPath
      animatedProps={animatedProps}
      d={gustFrame(gust, fromX, toX, 0).d}
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      opacity={0}
    />
  );
}

export function WindGusts({
  strength,
  fromX,
  toX,
  color,
}: {
  strength: WindStrength;
  fromX: number;
  toX: number;
  color: string;
}) {
  const progress = useLoop(GUST_LOOP_MS[strength]);
  return (
    <>
      {GUSTS[strength].map((gust) => (
        <WindGust
          key={`${gust.y}-${gust.phase}`}
          gust={gust}
          fromX={fromX}
          toX={toX}
          color={color}
          progress={progress}
        />
      ))}
    </>
  );
}
