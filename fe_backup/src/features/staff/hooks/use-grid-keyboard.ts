"use client";

import { useCallback, useState } from "react";
import type { GridCellCoords } from "./use-drag-select";

interface UseGridKeyboardProps {
  totalRows: number;
  totalCols: number;
  staff: { user_id: string }[];
  weekDays: Date[];
  formatDate: (date: Date) => string;
  onSelectionChange?: (cells: GridCellCoords[]) => void;
  enabled?: boolean;
}

interface FocusedCell {
  rowIndex: number;
  colIndex: number;
}

/**
 * Hook to handle keyboard navigation and selection in scheduling grid.
 * Implements WCAG 2.1.1 keyboard accessibility requirements.
 *
 * Controls:
 * - Arrow keys: Move focus
 * - Shift + Arrow: Extend selection
 * - Space/Enter: Toggle cell selection
 * - Escape: Clear selection
 * - Ctrl/Cmd + A: Select all visible cells
 */
export function useGridKeyboard({
  totalRows,
  totalCols,
  staff,
  weekDays,
  formatDate,
  onSelectionChange,
  enabled = true,
}: UseGridKeyboardProps) {
  const [focusedCell, setFocusedCell] = useState<FocusedCell | null>(null);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [selectionAnchor, setSelectionAnchor] = useState<FocusedCell | null>(null);

  // Generate cell key for Set operations
  const getCellKey = useCallback((rowIndex: number, colIndex: number) => {
    return `${rowIndex}_${colIndex}`;
  }, []);

  // Convert focused cell to GridCellCoords
  const toCoords = useCallback((rowIndex: number, colIndex: number): GridCellCoords | null => {
    if (rowIndex < 0 || rowIndex >= totalRows || colIndex < 0 || colIndex >= totalCols) {
      return null;
    }
    const staffMember = staff[rowIndex];
    const day = weekDays[colIndex];
    if (!staffMember || !day) return null;

    return {
      staffId: staffMember.user_id,
      dateStr: formatDate(day),
      rowIndex,
      colIndex,
    };
  }, [staff, weekDays, totalRows, totalCols, formatDate]);

  // Helper to convert Set to coords array
  const getCoordsFromSet = useCallback((set: Set<string>): GridCellCoords[] => {
    const coords: GridCellCoords[] = [];
    set.forEach((key) => {
      const [row, col] = key.split("_").map(Number);
      const coord = toCoords(row, col);
      if (coord) coords.push(coord);
    });
    return coords;
  }, [toCoords]);

  // Public getter that returns current selection as array
  const getSelectedCoordsArray = useCallback(() => {
    return getCoordsFromSet(selectedCells);
  }, [selectedCells, getCoordsFromSet]);

  // Unified selection update handler
  const updateSelection = useCallback((newSet: Set<string>, notify: boolean = true) => {
    setSelectedCells(newSet);
    if (notify && onSelectionChange) {
      onSelectionChange(getCoordsFromSet(newSet));
    }
  }, [onSelectionChange, getCoordsFromSet]);



  // Move focus with bounds checking
  const moveFocus = useCallback((deltaRow: number, deltaCol: number, extend: boolean) => {
    setFocusedCell(prev => {
      const current = prev || { rowIndex: 0, colIndex: 0 };
      const newRow = Math.max(0, Math.min(totalRows - 1, current.rowIndex + deltaRow));
      const newCol = Math.max(0, Math.min(totalCols - 1, current.colIndex + deltaCol));

      if (extend) {
        // Extend selection from anchor to new position
        const anchor = selectionAnchor || current;
        const minRow = Math.min(anchor.rowIndex, newRow);
        const maxRow = Math.max(anchor.rowIndex, newRow);
        const minCol = Math.min(anchor.colIndex, newCol);
        const maxCol = Math.max(anchor.colIndex, newCol);

        const newSelection = new Set<string>();
        for (let r = minRow; r <= maxRow; r++) {
          for (let c = minCol; c <= maxCol; c++) {
            newSelection.add(getCellKey(r, c));
          }
        }
        updateSelection(newSelection, true);
      }

      return { rowIndex: newRow, colIndex: newCol };
    });
  }, [totalRows, totalCols, selectionAnchor, getCellKey, updateSelection]);

  // Toggle single cell selection
  const toggleCellSelection = useCallback((rowIndex: number, colIndex: number) => {
    const key = getCellKey(rowIndex, colIndex);
    const newSet = new Set(selectedCells);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }

    // Set anchor for shift+arrow selection
    setSelectionAnchor({ rowIndex, colIndex });
    updateSelection(newSet, true);
  }, [getCellKey, selectedCells, updateSelection]);

  // Clear all selection
  const clearSelection = useCallback(() => {
    setSelectionAnchor(null);
    updateSelection(new Set(), true);
  }, [updateSelection]);

  // Select all cells
  const selectAll = useCallback(() => {
    const allKeys = new Set<string>();
    for (let r = 0; r < totalRows; r++) {
      for (let c = 0; c < totalCols; c++) {
        allKeys.add(getCellKey(r, c));
      }
    }
    updateSelection(allKeys, true);
  }, [totalRows, totalCols, getCellKey, updateSelection]);

  // Keyboard event handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!enabled) return;

    const { key, shiftKey, ctrlKey, metaKey } = e;

    switch (key) {
      case "ArrowUp":
        e.preventDefault();
        moveFocus(-1, 0, shiftKey);
        break;
      case "ArrowDown":
        e.preventDefault();
        moveFocus(1, 0, shiftKey);
        break;
      case "ArrowLeft":
        e.preventDefault();
        moveFocus(0, -1, shiftKey);
        break;
      case "ArrowRight":
        e.preventDefault();
        moveFocus(0, 1, shiftKey);
        break;
      case " ":
      case "Enter":
        e.preventDefault();
        if (focusedCell) {
          toggleCellSelection(focusedCell.rowIndex, focusedCell.colIndex);
        }
        break;
      case "Escape":
        e.preventDefault();
        clearSelection();
        break;
      case "a":
      case "A":
        if (ctrlKey || metaKey) {
          e.preventDefault();
          selectAll();
        }
        break;
    }
  }, [enabled, focusedCell, moveFocus, toggleCellSelection, clearSelection, selectAll]);

  // Check if a cell is focused
  const isCellFocused = useCallback((rowIndex: number, colIndex: number) => {
    return focusedCell?.rowIndex === rowIndex && focusedCell?.colIndex === colIndex;
  }, [focusedCell]);

  // Check if a cell is selected via keyboard
  const isCellKeyboardSelected = useCallback((rowIndex: number, colIndex: number) => {
    return selectedCells.has(getCellKey(rowIndex, colIndex));
  }, [selectedCells, getCellKey]);

  // Focus a specific cell (e.g., on click)
  const focusCell = useCallback((rowIndex: number, colIndex: number) => {
    setFocusedCell({ rowIndex, colIndex });
  }, []);

  // Set selected cells from external source (e.g., drag selection)
  // CRITICAL: notify=false to prevent infinite loop
  const setKeyboardSelection = useCallback((cells: GridCellCoords[]) => {
    const newSet = new Set<string>();
    cells.forEach(c => newSet.add(getCellKey(c.rowIndex, c.colIndex)));
    updateSelection(newSet, false);
    if (cells.length > 0) {
      setSelectionAnchor({ rowIndex: cells[0].rowIndex, colIndex: cells[0].colIndex });
    }
  }, [getCellKey, updateSelection]);

  return {
    focusedCell,
    handleKeyDown,
    isCellFocused,
    isCellKeyboardSelected,
    focusCell,
    clearSelection,
    setKeyboardSelection,
    getSelectedCoordsArray,
    selectedCellCount: selectedCells.size,
  };
}
