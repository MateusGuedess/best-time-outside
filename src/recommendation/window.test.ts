import type { ScoredHour } from "@/types/recommendation";

import { hourAt } from "@/test/forecastFactory";

import { findWindow } from "./window";

function scored(scores: number[], firstHour = 14): ScoredHour[] {
  return scores.map((score, index) => ({
    ...hourAt("2026-10-18", firstHour + index),
    period: "day",
    score,
  }));
}

describe("findWindow", () => {
  it("expands around the best hour while the neighbors stay close to it", () => {
    expect(findWindow(scored([40, 82, 88, 90, 85, 50]))).toEqual({ start: 1, end: 4 });
  });

  it("stops at four hours", () => {
    expect(findWindow(scored([90, 90, 90, 90, 90, 90]))).toEqual({ start: 0, end: 3 });
  });

  it("keeps a single hour when it stands out", () => {
    expect(findWindow(scored([60, 95, 70]))).toEqual({ start: 1, end: 1 });
  });

  it("does not expand into hours below the minimum score", () => {
    expect(findWindow(scored([55, 58, 57]))).toEqual({ start: 1, end: 1 });
  });

  it("grows towards the better neighbor first", () => {
    expect(findWindow(scored([80, 90, 85, 84, 83]))).toEqual({ start: 1, end: 4 });
    expect(findWindow(scored([30, 80, 90, 85, 84, 30]))).toEqual({ start: 1, end: 4 });
  });

  it("only picks the best hour within the searched range, but may grow past it", () => {
    const dayThenNight = scored([70, 85, 88, 95]);

    expect(findWindow(dayThenNight, 3)).toEqual({ start: 1, end: 3 });
  });

  it("prefers the earliest hour on ties", () => {
    expect(findWindow(scored([90, 40, 90]))).toEqual({ start: 0, end: 0 });
  });
});
