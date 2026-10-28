import type { SpawnPoint, Vec2 } from '../core/types/gameplay';

export function chooseSafestSpawn(
  spawns: SpawnPoint[],
  enemies: Vec2[],
  minimumDistance = 330,
): SpawnPoint {
  if (spawns.length === 0) throw new Error('At least one spawn point is required');
  if (enemies.length === 0) return spawns[0];

  const scored = spawns.map((spawn) => ({
    spawn,
    nearest: Math.min(...enemies.map((enemy) => Math.hypot(spawn.x - enemy.x, spawn.y - enemy.y))),
    combined: enemies.reduce(
      (sum, enemy) => sum + Math.hypot(spawn.x - enemy.x, spawn.y - enemy.y),
      0,
    ),
  }));
  const safe = scored.filter(({ nearest }) => nearest >= minimumDistance);
  return (safe.length > 0 ? safe : scored).sort(
    (left, right) => right.combined - left.combined || right.nearest - left.nearest,
  )[0].spawn;
}
