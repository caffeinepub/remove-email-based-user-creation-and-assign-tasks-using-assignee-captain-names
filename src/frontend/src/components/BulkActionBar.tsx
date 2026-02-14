import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  children?: React.ReactNode;
}

export default function BulkActionBar({ selectedCount, onClearSelection, children }: BulkActionBarProps) {
  return (
    <div className="sticky top-0 z-10 bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg mb-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="font-medium">
          {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="text-primary-foreground hover:bg-primary-foreground/20"
        >
          <X className="h-4 w-4 mr-1" />
          Clear selection
        </Button>
      </div>
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  );
}
