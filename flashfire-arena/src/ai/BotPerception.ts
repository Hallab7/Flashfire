import type { Vec2 } from '../core/types/gameplay';

export interface RectangleObstacle {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface SmokeZone extends Vec2 {
  radius: number;
  expiresAt: number;
}

function orientation(a: Vec2, b: Vec2, c: Vec2): number {
  return (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
}

function segmentsIntersect(a: Vec2, b: Vec2, c: Vec2, d: Vec2): boolean {
  const first = orientation(a, b, c);
  const second = orientation(a, b, d);
  const third = orientation(c, d, a);
  const fourth = orientation(c, d, b);
  return first * second < 0 && third * fourth < 0;
}

export function lineIntersectsRectangle(
  start: Vec2,
  end: Vec2,
  obstacle: RectangleObstacle,
): boolean {
  const topLeft = { x: obstacle.left, y: obstacle.top };
  const topRight = { x: obstacle.right, y: obstacle.top };
  const bottomLeft = { x: obstacle.left, y: obstacle.bottom };
  const bottomRight = { x: obstacle.right, y: obstacle.bottom };
  return (
    segmentsIntersect(start, end, topLeft, topRight) ||
    segmentsIntersect(start, end, topRight, bottomRight) ||
    segmentsIntersect(start, end, bottomRight, bottomLeft) ||
    segmentsIntersect(start, end, bottomLeft, topLeft)
  );
}

export function lineIntersectsCircle(
  start: Vec2,
  end: Vec2,
  center: Vec2,
  radius: number,
): boolean {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  const projection =
    lengthSquared === 0
      ? 0
      : Math.max(
          0,
          Math.min(1, ((center.x - start.x) * dx + (center.y - start.y) * dy) / lengthSquared),
        );
  const closestX = start.x + projection * dx;
  const closestY = start.y + projection * dy;
  return Math.hypot(center.x - closestX, center.y - closestY) <= radius;
}

export function hasLineOfSight(
  start: Vec2,
  end: Vec2,
  obstacles: RectangleObstacle[],
  smokeZones: SmokeZone[],
  now: number,
): boolean {
  return (
    !obstacles.some((obstacle) => lineIntersectsRectangle(start, end, obstacle)) &&
    !smokeZones.some(
      (smoke) => smoke.expiresAt > now && lineIntersectsCircle(start, end, smoke, smoke.radius),
    )
  );
}
