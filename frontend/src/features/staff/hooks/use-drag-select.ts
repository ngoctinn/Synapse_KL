import { useCallback, useEffect, useRef, useState } from "react";

export interface GridCellCoords {
  staffId: string;
  dateStr: string; // ISO Date YYYY-MM-DD
  colIndex: number;
  rowIndex: number;
}

export interface SelectionBox {
  start: GridCellCoords | null;
  end: GridCellCoords | null;
  isSelecting: boolean;
}

interface UseDragSelectProps {
  onSelectionComplete?: (selectedCells: GridCellCoords[]) => void;
  enabled?: boolean;
}

export function useDragToSelect({ onSelectionComplete, enabled = true }: UseDragSelectProps = {}) {
  const [selection, setSelection] = useState<SelectionBox>({
    start: null,
    end: null,
    isSelecting: false,
  });

  // Track if we are currently in a drag operation to prevent text selection
  const isDraggingRef = useRef(false);

  const handlePointerDown = useCallback((cell: GridCellCoords, e: React.PointerEvent) => {
    if (!enabled || e.button !== 0) return; // Only Left Click

    // e.preventDefault(); // allow scrolling if needed, but for drag-select typically prevent default
    // We prevent default to stop text selection, but if we want scrolling on touch, we need careful handling.
    // Given the request "why can't I drag", we ensure mouse works first.
    if (e.pointerType === 'mouse') {
        e.preventDefault();
    }

    // Do NOT use setPointerCapture, it breaks onPointerEnter for other elements
    // (e.target as Element).setPointerCapture(e.pointerId);

    isDraggingRef.current = true;
    setSelection({
      start: cell,
      end: cell,
      isSelecting: true,
    });
  }, [enabled]);

  const handlePointerEnter = useCallback((cell: GridCellCoords) => {
    if (!isDraggingRef.current) return;

    setSelection((prev) => ({
      ...prev,
      end: cell,
    }));
  }, []);

  // Global Pointer Up listener to catch release anywhere
  useEffect(() => {
    const handleWindowPointerUp = () => {
        if (isDraggingRef.current) {
            isDraggingRef.current = false;
            // No need to release capture if we didn't set it
            setSelection((prev) => ({ ...prev, isSelecting: false }));
        }
    };

    window.addEventListener('pointerup', handleWindowPointerUp);
    return () => {
        window.removeEventListener('pointerup', handleWindowPointerUp);
    };
  }, []);

  // Kept for backward compat but unused if window listener works
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setSelection((prev) => ({ ...prev, isSelecting: false }));
  }, []);

  // Expose a helper to reset selection
  const clearSelection = useCallback(() => {
    setSelection({
      start: null,
      end: null,
      isSelecting: false,
    });
  }, []);

  // Helper to determine if a cell is selected
  // This logic works for Rectangular selection
  const isCellSelected = useCallback((colIndex: number, rowIndex: number) => {
    if (!selection.start || !selection.end) return false;

    const minCol = Math.min(selection.start.colIndex, selection.end.colIndex);
    const maxCol = Math.max(selection.start.colIndex, selection.end.colIndex);
    const minRow = Math.min(selection.start.rowIndex, selection.end.rowIndex);
    const maxRow = Math.max(selection.start.rowIndex, selection.end.rowIndex);

    return (
      colIndex >= minCol &&
      colIndex <= maxCol &&
      rowIndex >= minRow &&
      rowIndex <= maxRow
    );
  }, [selection]);

  return {
    selection,
    handlePointerDown,
    handlePointerEnter,
    handlePointerUp,
    clearSelection,
    isCellSelected,
    isDragging: selection.isSelecting
  };
}
