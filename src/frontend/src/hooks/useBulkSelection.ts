import { useState, useMemo } from 'react';

export function useBulkSelection<T extends { id?: string } | [string, any]>(
  items: T[],
  getId: (item: T) => string
) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAllVisible = () => {
    const visibleIds = items.map(getId);
    const allSelected = visibleIds.every(id => selectedIds.has(id));
    
    if (allSelected) {
      // Deselect all visible
      setSelectedIds(prev => {
        const next = new Set(prev);
        visibleIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      // Select all visible
      setSelectedIds(prev => {
        const next = new Set(prev);
        visibleIds.forEach(id => next.add(id));
        return next;
      });
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const isSelected = (id: string) => selectedIds.has(id);

  const headerCheckboxState = useMemo(() => {
    if (items.length === 0) return 'unchecked';
    const visibleIds = items.map(getId);
    const selectedVisibleCount = visibleIds.filter(id => selectedIds.has(id)).length;
    
    if (selectedVisibleCount === 0) return 'unchecked';
    if (selectedVisibleCount === visibleIds.length) return 'checked';
    return 'indeterminate';
  }, [items, selectedIds, getId]);

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    toggleOne,
    toggleAllVisible,
    clearSelection,
    isSelected,
    headerCheckboxState,
  };
}
