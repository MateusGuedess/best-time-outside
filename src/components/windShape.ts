export type Gust = { y: number; length: number; phase: number };

export type WindStrength = "breezy" | "strong";

export const GUSTS: Record<WindStrength, Gust[]> = {
  breezy: [
    { y: 74, length: 56, phase: 0 },
    { y: 118, length: 44, phase: 0.5 },
  ],
  strong: [
    { y: 62, length: 64, phase: 0 },
    { y: 92, length: 50, phase: 0.27 },
    { y: 122, length: 58, phase: 0.55 },
    { y: 78, length: 40, phase: 0.8 },
  ],
};

export const GUST_LOOP_MS: Record<WindStrength, number> = { breezy: 6000, strong: 2800 };

export type GustFrame = { d: string; opacity: number };

export function gustPath(x: number, y: number, length: number): string {
  "worklet";
  const curl = length * 0.12;
  return [
    `M ${x} ${y}`,
    `C ${x + length * 0.3} ${y - 3} ${x + length * 0.6} ${y + 3} ${x + length} ${y}`,
    `a ${curl} ${curl} 0 1 0 ${-curl} ${-curl}`,
  ].join(" ");
}

export function gustFrame(gust: Gust, fromX: number, toX: number, progress: number): GustFrame {
  "worklet";
  const travel = (progress + gust.phase) % 1;
  const x = fromX - gust.length + (toX - fromX + gust.length) * travel;
  return {
    d: gustPath(x, gust.y + Math.sin(travel * Math.PI * 2) * 2, gust.length),
    opacity: Math.sin(travel * Math.PI),
  };
}
