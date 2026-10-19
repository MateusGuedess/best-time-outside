import { birdPath, WING_DOWN, WING_UP } from "./birdShape";

function coordinates(path: string): number[][] {
  return Array.from(path.matchAll(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g), ([, x, y]) => [
    Number(x),
    Number(y),
  ]);
}

describe("birdPath", () => {
  it.each([WING_UP, 0, WING_DOWN])(
    "mirrors the bird around x when flying left (lift %s)",
    (lift) => {
      const right = coordinates(birdPath(100, 50, 1, lift, 1));
      const left = coordinates(birdPath(100, 50, 1, lift, -1));

      expect(left).toHaveLength(right.length);
      left.forEach(([x, y], index) => {
        expect(x).toBeCloseTo(200 - right[index]![0]!);
        expect(y).toBeCloseTo(right[index]![1]!);
      });
    },
  );

  it("raises the wing tips above the body on the up stroke", () => {
    const highest = Math.min(...coordinates(birdPath(0, 0, 1, WING_UP, 1)).map(([, y]) => y!));
    expect(highest).toBeLessThan(WING_UP * 0.9);
  });
});
