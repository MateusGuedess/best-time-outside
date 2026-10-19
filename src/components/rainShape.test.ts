import { boltPath, cloudPath, dropFrame, flashIntensity, RAIN_FALL, RAIN_TOP } from "./rainShape";

function firstPoint(path: string): number[] {
  const [, x, y] = /M (-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/.exec(path) ?? [];
  return [Number(x), Number(y)];
}

describe("dropFrame", () => {
  const drop = { x: 150, phase: 0 };

  it("falls from under the cloud and fades out at the bottom", () => {
    const start = dropFrame(drop, 0, 0.15);
    const end = dropFrame(drop, 0, 0.99);

    expect(firstPoint(start.d)[1]).toBeCloseTo(RAIN_TOP + RAIN_FALL * 0.15);
    expect(firstPoint(end.d)[1]).toBeGreaterThan(firstPoint(start.d)[1]!);
    expect(start.opacity).toBeCloseTo(1);
    expect(end.opacity).toBeLessThan(0.05);
  });

  it("follows the cloud when it drifts", () => {
    expect(firstPoint(dropFrame(drop, 6, 0.5).d)[0]).toBeCloseTo(
      firstPoint(dropFrame(drop, 0, 0.5).d)[0]! + 6,
    );
  });
});

describe("flashIntensity", () => {
  it("flashes twice, the second time weaker, and stays dark the rest of the loop", () => {
    expect(flashIntensity(0.085)).toBeCloseTo(1);
    expect(flashIntensity(0.175)).toBeCloseTo(0.7);
    expect(flashIntensity(0.4)).toBe(0);
    expect(flashIntensity(0.9)).toBe(0);
  });
});

describe("cloud drift", () => {
  it("moves the bolt together with the cloud", () => {
    expect(firstPoint(cloudPath(5))[0]).toBeCloseTo(firstPoint(cloudPath(0))[0]! + 5);
    expect(firstPoint(boltPath(5))[0]).toBeCloseTo(firstPoint(boltPath(0))[0]! + 5);
  });
});
