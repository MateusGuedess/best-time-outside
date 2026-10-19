import { seaLines } from "./seaLines";

describe("seaLines", () => {
  const lines = seaLines(220, 320);

  it("fills the sea from the horizon down", () => {
    expect(lines[0]?.y).toBe(220);
    expect(lines[lines.length - 1]?.y).toBeLessThan(320);
    expect(lines.length).toBeGreaterThan(10);
  });

  it("fades and drifts more with depth", () => {
    lines.slice(1).forEach((line, index) => {
      expect(line.opacity).toBeLessThan(lines[index]!.opacity);
      expect(line.drift).toBeGreaterThan(lines[index]!.drift);
    });
  });
});
