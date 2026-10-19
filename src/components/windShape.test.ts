import { gustFrame, GUSTS } from "./windShape";

function startX(path: string): number {
  return Number(/M (-?\d+(?:\.\d+)?)/.exec(path)?.[1]);
}

describe("gustFrame", () => {
  const gust = { y: 80, length: 50, phase: 0 };

  it("crosses the scene from left to right", () => {
    expect(startX(gustFrame(gust, 0, 300, 0.2).d)).toBeLessThan(
      startX(gustFrame(gust, 0, 300, 0.7).d),
    );
  });

  it("fades in and out at the edges", () => {
    expect(gustFrame(gust, 0, 300, 0).opacity).toBeCloseTo(0);
    expect(gustFrame(gust, 0, 300, 0.5).opacity).toBeCloseTo(1);
  });
});

describe("GUSTS", () => {
  it("shows more gusts when the wind is strong", () => {
    expect(GUSTS.strong.length).toBeGreaterThan(GUSTS.breezy.length);
  });
});
