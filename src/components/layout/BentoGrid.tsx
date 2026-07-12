// src/components/layout/BentoGrid.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

export interface BentoGridItem {
  id: string | number;
  type: 'hero' | 'wide' | 'large' | 'medium' | 'small';
  content: React.ReactNode;
  colSpan?: number;
  rowSpan?: number;
}

interface BentoGridProps {
  items: BentoGridItem[];
  columns?: number;
  gap?: number;
  className?: string;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  ListHeaderComponent?: React.ReactNode;
  ListFooterComponent?: React.ReactNode;
}

// Predefined grid patterns
const GRID_PATTERNS: Record<string, BentoGridItem['type'][]> = {
  // Hero + 3 small (perfect for destinations)
  heroThree: ['hero', 'small', 'small', 'small'],
  // 2x2 grid
  twoByTwo: ['medium', 'medium', 'medium', 'medium'],
  // Featured large + list
  featuredList: ['large', 'medium', 'medium', 'medium'],
  // Alternating wide/medium
  alternating: ['wide', 'medium', 'wide', 'medium'],
  // Magazine style
  magazine: ['hero', 'small', 'small', 'medium', 'medium', 'small'],
};

const TYPE_DIMENSIONS: Record<BentoGridItem['type'], { colSpan: number; rowSpan: number }> = {
  hero: { colSpan: 2, rowSpan: 2 },
  wide: { colSpan: 2, rowSpan: 1 },
  large: { colSpan: 2, rowSpan: 2 },
  medium: { colSpan: 1, rowSpan: 1 },
  small: { colSpan: 1, rowSpan: 1 },
};

function calculateLayout(
  items: BentoGridItem[],
  columns: number
): { row: number; col: number; colSpan: number; rowSpan: number; item: BentoGridItem }[] {
  const grid: (boolean | BentoGridItem)[][] = [];
  const layout: { row: number; col: number; colSpan: number; rowSpan: number; item: BentoGridItem }[] = [];

  for (const item of items) {
    const dims = item.colSpan && item.rowSpan
      ? { colSpan: item.colSpan, rowSpan: item.rowSpan }
      : TYPE_DIMENSIONS[item.type];

    let placed = false;

    for (let row = 0; row < 100 && !placed; row++) {
      // Ensure grid has enough rows
      while (grid.length <= row + dims.rowSpan - 1) {
        grid.push(new Array(columns).fill(false));
      }

      for (let col = 0; col <= columns - dims.colSpan && !placed; col++) {
        // Check if space is available
        let canPlace = true;
        for (let dr = 0; dr < dims.rowSpan; dr++) {
          for (let dc = 0; dc < dims.colSpan; dc++) {
            if (grid[row + dr][col + dc] !== false) {
              canPlace = false;
              break;
            }
          }
          if (!canPlace) break;
        }

        if (canPlace) {
          // Place item
          for (let dr = 0; dr < dims.rowSpan; dr++) {
            for (let dc = 0; dc < dims.colSpan; dc++) {
              grid[row + dr][col + dc] = item;
            }
          }

          layout.push({
            row,
            col,
            colSpan: dims.colSpan,
            rowSpan: dims.rowSpan,
            item,
          });
          placed = true;
        }
      }
    }

    if (!placed) {
      // Fallback: place at end
      const row = grid.length;
      while (grid.length <= row + dims.rowSpan - 1) {
        grid.push(new Array(columns).fill(false));
      }
      for (let dr = 0; dr < dims.rowSpan; dr++) {
        for (let dc = 0; dc < dims.colSpan; dc++) {
          grid[row + dr][dc] = item;
        }
      }
      layout.push({
        row,
        col: 0,
        colSpan: Math.min(dims.colSpan, columns),
        rowSpan: dims.rowSpan,
        item,
      });
    }
  }

  return layout;
}

export const BentoGrid = ({
  items,
  columns = 2,
  gap = 12,
  className = '',
  style,
  contentContainerStyle,
  ListHeaderComponent,
  ListFooterComponent,
}: BentoGridProps) => {
  const layout = calculateLayout(items, columns);

  // Group by rows
  const maxRow = Math.max(...layout.map((l) => l.row + l.rowSpan - 1), -1);
  const rows: typeof layout[] = [];
  for (let r = 0; r <= maxRow; r++) {
    const rowItems = layout.filter((l) => l.row <= r && l.row + l.rowSpan - 1 >= r);
    if (rowItems.length > 0) {
      rows.push(rowItems);
    }
  }

  return (
    <View style={[styles.container, style]} className={className}>
      {ListHeaderComponent}
      <View style={[styles.grid, contentContainerStyle, { gap }]}>
        {rows.map((rowItems, rowIndex) => (
          <View key={rowIndex} style={[styles.row, { gap }]}>
            {rowItems.map(({ colSpan, item }, cellIndex) => (
              <View
                key={`${rowIndex}-${cellIndex}`}
                style={[
                  styles.cell,
                  {
                    flex: colSpan,
                    minWidth: 0, // Allow flex shrinking
                  },
                ]}
              >
                {item.content}
              </View>
            ))}
          </View>
        ))}
      </View>
      {ListFooterComponent}
    </View>
  );
};

// Pattern-based BentoGrid for common layouts
export const BentoGridPattern = ({
  items,
  pattern = 'heroThree',
  columns = 2,
  gap = 12,
  className = '',
  style,
}: Omit<BentoGridProps, 'items'> & { items: React.ReactNode[]; pattern?: keyof typeof GRID_PATTERNS }) => {
  const patternTypes = GRID_PATTERNS[pattern] || GRID_PATTERNS.heroThree;
  const bentoItems: BentoGridItem[] = items.map((content, index) => ({
    id: index,
    type: patternTypes[index] || 'medium',
    content,
  }));

  return (
    <BentoGrid
      items={bentoItems}
      columns={columns}
      gap={gap}
      className={className}
      style={style}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  grid: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    flexWrap: 'wrap',
  },
  cell: {
    // Base cell styles
  },
});

export default BentoGrid;