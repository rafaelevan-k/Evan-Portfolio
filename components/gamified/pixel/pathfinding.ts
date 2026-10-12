import type { Cell, Interaction } from "./world";

const key = (p: Cell) => `${p.x},${p.y}`;
const walkable = (grid: number[][], p: Cell) => grid[p.y]?.[p.x] === 0;
const adjacent = (p: Cell): Cell[] => [{ x: p.x + 1, y: p.y }, { x: p.x - 1, y: p.y }, { x: p.x, y: p.y + 1 }, { x: p.x, y: p.y - 1 }];
const heuristic = (p: Cell, goals: Cell[]) => Math.min(...goals.map((g) => Math.abs(g.x - p.x) + Math.abs(g.y - p.y)));

/** Four-way A*: diagonals never cut through a corner or a solid tile. */
export function findPath(grid: number[][], start: Cell, goals: Cell[]): Cell[] | null {
  const validGoals = goals.filter((g) => walkable(grid, g));
  if (!walkable(grid, start) || !validGoals.length) return null;
  const goalKeys = new Set(validGoals.map(key));
  const open: Cell[] = [start];
  const openKeys = new Set([key(start)]);
  const closed = new Set<string>();
  const parents = new Map<string, Cell>();
  const scores = new Map([[key(start), 0]]);
  while (open.length) {
    let best = 0;
    for (let i = 1; i < open.length; i++) {
      if ((scores.get(key(open[i])) ?? Infinity) + heuristic(open[i], validGoals) < (scores.get(key(open[best])) ?? Infinity) + heuristic(open[best], validGoals)) best = i;
    }
    const current = open.splice(best, 1)[0];
    const currentKey = key(current);
    openKeys.delete(currentKey);
    if (goalKeys.has(currentKey)) {
      const path = [current];
      while (parents.has(key(path[0]))) path.unshift(parents.get(key(path[0]))!);
      return path.slice(1);
    }
    closed.add(currentKey);
    for (const next of adjacent(current)) {
      const nextKey = key(next);
      if (!walkable(grid, next) || closed.has(nextKey)) continue;
      const score = (scores.get(currentKey) ?? 0) + 1;
      if (score >= (scores.get(nextKey) ?? Infinity)) continue;
      parents.set(nextKey, current);
      scores.set(nextKey, score);
      if (!openKeys.has(nextKey)) { open.push(next); openKeys.add(nextKey); }
    }
  }
  return null;
}

/** Route to a reachable cell within the object's configured interaction range. */
export function interactionGoals(grid: number[][], target: Interaction, tileSize = 16): Cell[] {
  const goals: Cell[] = [];
  const radius = Math.ceil(target.range / tileSize);
  const x = Math.floor(target.x / tileSize);
  const y = Math.floor(target.y / tileSize);
  for (let yy = y - radius; yy <= y + radius; yy++) for (let xx = x - radius; xx <= x + radius; xx++) {
    const cell = { x: xx, y: yy };
    if (walkable(grid, cell) && Math.hypot((xx + 0.5) * tileSize - target.x, (yy + 0.5) * tileSize - target.y) <= target.range) goals.push(cell);
  }
  return goals;
}
