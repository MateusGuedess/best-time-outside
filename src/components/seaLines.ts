export type SeaLine = {
  y: number;
  height: number;
  opacity: number;
  drift: number;
};

const SPACING = 6.5;
const LINE_HEIGHT = 2.4;

export function seaLines(top: number, bottom: number): SeaLine[] {
  const count = Math.floor((bottom - top) / SPACING);
  return Array.from({ length: count }, (_, index) => {
    const depth = index / Math.max(1, count - 1);
    return {
      y: top + index * SPACING,
      height: LINE_HEIGHT * (1 - depth * 0.3),
      opacity: 0.06 + 0.9 * (1 - depth) ** 1.8,
      drift: 2 + depth * 5,
    };
  });
}
