export const RAIN_TOP = 150;
export const RAIN_FALL = 48;

const DROP_LENGTH = 12;
const DROP_SLANT = -4;

export type Drop = { x: number; phase: number };

export const DROPS: Drop[] = [
  { x: 104, phase: 0 },
  { x: 120, phase: 0.55 },
  { x: 136, phase: 0.2 },
  { x: 152, phase: 0.75 },
  { x: 168, phase: 0.35 },
  { x: 184, phase: 0.9 },
  { x: 200, phase: 0.1 },
  { x: 216, phase: 0.6 },
  { x: 232, phase: 0.4 },
];

export function cloudPath(dx: number): string {
  "worklet";
  const x = (value: number) => value + dx;
  return [
    `M ${x(82)} 138`,
    `A 24 24 0 0 1 ${x(88)} 98`,
    `A 30 30 0 0 1 ${x(132)} 80`,
    `A 38 38 0 0 1 ${x(202)} 84`,
    `A 28 28 0 0 1 ${x(242)} 112`,
    `A 16 16 0 0 1 ${x(246)} 132`,
    `Q ${x(262)} 132 ${x(272)} 118`,
    `Q ${x(272)} 148 ${x(238)} 150`,
    `H ${x(94)}`,
    `A 12 12 0 0 1 ${x(82)} 138 Z`,
  ].join(" ");
}

function spiral(cx: number, cy: number, turns: number, maxRadius: number): string {
  "worklet";
  const steps = Math.round(turns * 28);
  const points: string[] = [];
  for (let step = 0; step <= steps; step++) {
    const travel = step / steps;
    const angle = travel * turns * Math.PI * 2;
    const radius = 1.2 + (maxRadius - 1.2) * travel;
    points.push(
      `${(cx + Math.cos(angle) * radius).toFixed(1)} ${(cy + Math.sin(angle) * radius).toFixed(1)}`,
    );
  }
  return `M ${points.join(" L ")}`;
}

export function swirlPath(dx: number): string {
  "worklet";
  return `${spiral(128 + dx, 118, 2.1, 15)} ${spiral(192 + dx, 110, 1.6, 9)}`;
}

export function boltPath(dx: number): string {
  "worklet";
  const x = (value: number) => value + dx;
  return `M ${x(226)} 88 L ${x(218)} 102 L ${x(225)} 102 L ${x(219)} 116 L ${x(232)} 98 L ${x(225)} 98 L ${x(231)} 88 Z`;
}

export type DropFrame = { d: string; opacity: number };

export function dropFrame(drop: Drop, dx: number, progress: number): DropFrame {
  "worklet";
  const travel = (progress + drop.phase) % 1;
  const top = RAIN_TOP + RAIN_FALL * travel;
  const left = drop.x + dx + DROP_SLANT * travel * (RAIN_FALL / DROP_LENGTH);
  return {
    d: `M ${left} ${top} l ${DROP_SLANT} ${DROP_LENGTH}`,
    opacity: travel < 0.15 ? travel / 0.15 : 1 - (travel - 0.15) / 0.85,
  };
}

function pulse(progress: number, start: number, length: number): number {
  "worklet";
  const position = (progress - start) / length;
  if (position < 0 || position > 1) return 0;
  return 1 - Math.abs(position * 2 - 1);
}

export function flashIntensity(progress: number): number {
  "worklet";
  return Math.max(pulse(progress, 0.06, 0.05), 0.7 * pulse(progress, 0.14, 0.07));
}
