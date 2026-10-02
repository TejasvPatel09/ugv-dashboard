import { Vec2 } from './types';

export function distance(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function polylineLength(points: Vec2[]): number {
  let len = 0;
  for (let i = 0; i < points.length - 1; i++) {
    len += distance(points[i], points[i + 1]);
  }
  return len;
}

export function getPointAtDistance(points: Vec2[], d: number): { point: Vec2; heading: number } | null {
  if (points.length === 0) return null;
  if (points.length === 1) return { point: points[0], heading: 0 };
  
  if (d <= 0) {
    return { point: points[0], heading: getHeading(points[0], points[1]) };
  }

  let traveled = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const segmentLen = distance(p1, p2);

    if (traveled + segmentLen >= d) {
      const remainder = d - traveled;
      const ratio = segmentLen === 0 ? 0 : remainder / segmentLen;
      const x = p1.x + (p2.x - p1.x) * ratio;
      const y = p1.y + (p2.y - p1.y) * ratio;
      return { point: { x, y }, heading: getHeading(p1, p2) };
    }
    traveled += segmentLen;
  }

  // Beyond end
  const last = points[points.length - 1];
  const secondLast = points[points.length - 2];
  return { point: last, heading: getHeading(secondLast, last) };
}

export function getHeading(p1: Vec2, p2: Vec2): number {
  const dy = p2.y - p1.y;
  const dx = p2.x - p1.x;
  let rad = Math.atan2(dy, dx);
  let deg = (rad * 180) / Math.PI;
  if (deg < 0) deg += 360;
  return deg;
}

export function normalizeHeading(deg: number): number {
  deg = deg % 360;
  if (deg < 0) deg += 360;
  return deg;
}

export function angleDiff(target: number, current: number): number {
  let diff = target - current;
  diff = (diff + 180) % 360 - 180;
  if (diff < -180) diff += 360;
  return diff;
}
