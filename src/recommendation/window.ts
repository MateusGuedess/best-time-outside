import type { ScoredHour } from "@/types/recommendation";

import { windowRules } from "./config";

export type WindowRange = { start: number; end: number };

function bestIndex(hours: readonly ScoredHour[], searchUntil: number): number {
  let best = 0;
  for (let index = 1; index < searchUntil; index++) {
    if (hours[index]!.score > hours[best]!.score) best = index;
  }
  return best;
}

export function findWindow(hours: readonly ScoredHour[], searchUntil = hours.length): WindowRange {
  const best = bestIndex(hours, searchUntil);
  const bestScore = hours[best]!.score;
  const isEligible = (index: number) => {
    const hour = hours[index];
    return (
      hour !== undefined &&
      hour.score >= windowRules.minScore &&
      bestScore - hour.score <= windowRules.maxDistanceFromBest
    );
  };

  let start = best;
  let end = best;
  while (end - start + 1 < windowRules.maxHours) {
    const canGrowLeft = isEligible(start - 1);
    const canGrowRight = isEligible(end + 1);
    if (!canGrowLeft && !canGrowRight) break;

    const growLeft =
      canGrowLeft && (!canGrowRight || hours[start - 1]!.score >= hours[end + 1]!.score);
    if (growLeft) start--;
    else end++;
  }

  return { start, end };
}
