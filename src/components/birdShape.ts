export const WING_UP = -12;
export const WING_DOWN = 8;

type Point = (px: number, py: number) => string;

function wing(point: Point, shoulder: number, lift: number, reach: number): string {
  "worklet";
  const span = lift * reach;
  const front = point(3 + shoulder, -0.8 - shoulder * 0.3);
  const leading = point(1.5 + shoulder, span * 0.8);
  const tip = point(-4.5 + shoulder, span * 1.08);
  const feathers = [
    point(-5.6 + shoulder, span * 0.86),
    point(-7.6 + shoulder, span * 0.9),
    point(-7.2 + shoulder, span * 0.7),
    point(-9.4 + shoulder, span * 0.66),
    point(-8.4 + shoulder, span * 0.46),
  ];
  const trailing = point(-8.2 + shoulder, span * 0.12 + 0.4);
  const rear = point(-3 + shoulder, 0.4);
  if (lift < 0) {
    const reversed = [...feathers].reverse().join(" L ");
    return `M ${rear} Q ${trailing} ${reversed} L ${tip} Q ${leading} ${front} Z`;
  }
  return `M ${front} Q ${leading} ${tip} L ${feathers.join(" L ")} Q ${trailing} ${rear} Z`;
}

export function birdPath(
  x: number,
  y: number,
  scale: number,
  lift: number,
  direction: 1 | -1,
): string {
  "worklet";
  const point: Point = (px, py) => `${x + px * scale * direction} ${y + py * scale}`;
  const body = [
    `M ${point(-6.5, 0.2)}`,
    `Q ${point(-1, -2.6)} ${point(4.5, -1.6)}`,
    `Q ${point(6.4, -2.6)} ${point(8, -1.4)}`,
    `L ${point(10.2, -0.6)}`,
    `L ${point(7.8, 0.2)}`,
    `Q ${point(5, 2.4)} ${point(0, 2.2)}`,
    `Q ${point(-4, 2)} ${point(-6.5, 0.2)} Z`,
  ].join(" ");
  const tail = `M ${point(-6, 1.3)} L ${point(-10.2, 2.4)} L ${point(-10.8, 0.6)} L ${point(-10.2, -1)} L ${point(-6, -0.3)} Z`;
  return [wing(point, 1.6, lift, 0.75), body, tail, wing(point, 0, lift, 1)].join(" ");
}

export type FlockMember = {
  dx: number;
  dy: number;
  scale: number;
  speed: number;
  flapPhase: number;
  wave: number;
  waveCycles: number;
  climb: number;
};

export type Crossing = { fromX: number; toX: number; y: number; shrink: number };

export type FlockPosition = { x: number; y: number; scale: number; direction: 1 | -1 };

export function flockPosition(
  member: FlockMember,
  crossing: Crossing,
  progress: number,
): FlockPosition {
  "worklet";
  const legs = progress * 2;
  const isReturning = legs >= 1;
  const travel = isReturning ? legs - 1 : legs;
  const direction = isReturning ? -1 : 1;
  const distance = 1 - crossing.shrink * travel;
  const covered = (crossing.toX - crossing.fromX) * travel * member.speed;
  const along = isReturning ? crossing.toX - covered : crossing.fromX + covered;
  return {
    x: along + member.dx * distance * direction,
    y:
      crossing.y +
      member.dy * distance -
      member.climb * travel +
      member.wave * Math.sin(travel * member.waveCycles * Math.PI * 2),
    scale: member.scale * distance,
    direction,
  };
}
