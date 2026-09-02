import type { Project } from "@/lib/data";

/**
 * Distributes items into `columnCount` columns using a greedy
 * shortest-column-first strategy (the standard "masonry" placement),
 * so the grid reads left-to-right in roughly the order items were given
 * instead of filling one column completely before starting the next
 * (which is what plain CSS `columns` does).
 */
export function distributeColumns(
  items: Project[],
  columnCount: number
): Project[][] {
  const columns: Project[][] = Array.from({ length: columnCount }, () => []);
  const heights = new Array(columnCount).fill(0);

  for (const item of items) {
    const cover = item.images[0];
    const aspectHeight = cover.height / cover.width;

    let shortest = 0;
    for (let i = 1; i < columnCount; i++) {
      if (heights[i] < heights[shortest]) shortest = i;
    }

    columns[shortest].push(item);
    heights[shortest] += aspectHeight;
  }

  return columns;
}
