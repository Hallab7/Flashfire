import type { Vec2 } from '../core/types/gameplay';

export interface NavigationNode extends Vec2 {
  id: string;
  neighbors: string[];
}

export class NavigationGraph {
  private readonly nodes = new Map<string, NavigationNode>();

  constructor(nodes: NavigationNode[]) {
    nodes.forEach((node) => this.nodes.set(node.id, node));
  }

  closest(position: Vec2): NavigationNode | null {
    return (
      [...this.nodes.values()].sort(
        (left, right) =>
          Math.hypot(left.x - position.x, left.y - position.y) -
          Math.hypot(right.x - position.x, right.y - position.y),
      )[0] ?? null
    );
  }

  nextToward(position: Vec2, target: Vec2): NavigationNode | null {
    const current = this.closest(position);
    if (!current) return null;
    const candidates = [
      current,
      ...current.neighbors
        .map((id) => this.nodes.get(id))
        .filter((node): node is NavigationNode => Boolean(node)),
    ];
    return candidates.sort(
      (left, right) =>
        Math.hypot(left.x - target.x, left.y - target.y) -
        Math.hypot(right.x - target.x, right.y - target.y),
    )[0];
  }
}
