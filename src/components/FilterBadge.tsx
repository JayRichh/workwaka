import { XMarkIcon } from '@heroicons/react/24/outline';

interface FilterBadgeProps {
  label: string;
  value: string;
  onRemove: () => void;
}

export function FilterBadge({ label, value, onRemove }: FilterBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
      {label}: {value}
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex rounded-full p-0.5 hover:bg-blue-200 transition-colors"
      >
        <XMarkIcon className="h-3 w-3" aria-hidden="true" />
      </button>
    </span>
  );
}
