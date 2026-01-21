'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { REQUEST_STATUS_FILTER_ALL, REQUEST_STATUS_OPTIONS } from '@/lib/requests/request-status';
import type { RequestStatusFilter } from '@/lib/requests/request-status';

const ALL_STATUS_LABEL = 'Все статусы';

interface RequestStatusSelectProps {
  value: RequestStatusFilter;
  onChange: (value: RequestStatusFilter) => void;
  includeAllOption?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function RequestStatusSelect({
  value,
  onChange,
  includeAllOption = false,
  placeholder,
  disabled,
  className,
}: RequestStatusSelectProps) {
  const handleValueChange = (nextValue: string) => {
    onChange(nextValue as RequestStatusFilter);
  };

  return (
    <Select value={value} onValueChange={handleValueChange} disabled={disabled}>
      <SelectTrigger className={cn('w-full', className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeAllOption && (
          <SelectItem value={REQUEST_STATUS_FILTER_ALL}>{ALL_STATUS_LABEL}</SelectItem>
        )}
        {REQUEST_STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
