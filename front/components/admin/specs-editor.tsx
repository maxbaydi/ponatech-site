 'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type SpecItem = {
  key: string;
  value: string;
};

export const specsRecordToItems = (specs?: Record<string, unknown> | null): SpecItem[] => {
  if (!specs) return [];
  return Object.entries(specs).map(([key, value]) => ({
    key,
    value: value === null || value === undefined ? '' : String(value),
  }));
};

export const specsItemsToRecord = (items?: SpecItem[]): Record<string, string> => {
  const record: Record<string, string> = {};
  (items ?? []).forEach((item) => {
    const key = item.key.trim();
    if (!key) return;
    record[key] = item.value ?? '';
  });
  return record;
};

interface SpecsEditorProps {
  value?: SpecItem[];
  onChange: (nextValue: SpecItem[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  addLabel?: string;
  removeLabel?: string;
}

export function SpecsEditor({
  value,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  addLabel = 'Add',
  removeLabel = 'Remove',
}: SpecsEditorProps) {
  const items = value ?? [];

  const updateItem = (index: number, patch: Partial<SpecItem>) => {
    const next = items.map((item, idx) => (idx === index ? { ...item, ...patch } : item));
    onChange(next);
  };

  const removeItem = (index: number) => {
    const next = items.filter((_, idx) => idx !== index);
    onChange(next);
  };

  const addItem = () => {
    onChange([...items, { key: '', value: '' }]);
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={`spec-${index}`}
          className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 items-center"
        >
          <Input
            placeholder={keyPlaceholder}
            value={item.key}
            onChange={(event) => updateItem(index, { key: event.target.value })}
          />
          <Input
            placeholder={valuePlaceholder}
            value={item.value}
            onChange={(event) => updateItem(index, { value: event.target.value })}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={removeLabel}
            onClick={() => removeItem(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addItem}>
        <Plus className="mr-2 h-4 w-4" />
        {addLabel}
      </Button>
    </div>
  );
}
