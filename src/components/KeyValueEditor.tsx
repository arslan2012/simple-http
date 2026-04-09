import type { KeyValue } from '../types';

interface KeyValueEditorProps {
  items: KeyValue[];
  onChange: (items: KeyValue[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

export function KeyValueEditor({
  items,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
}: KeyValueEditorProps) {
  const addRow = () => {
    onChange([...items, { key: '', value: '', enabled: true }]);
  };

  const updateRow = (index: number, field: keyof KeyValue, value: string | boolean) => {
    onChange(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const removeRow = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-0.5">
      {items.length > 0 && (
        <div
          className="grid gap-1 px-1 pb-1.5 text-[11px] text-text-faint font-semibold uppercase tracking-[0.04em]"
          style={{ gridTemplateColumns: '20px 1fr 1fr 24px' }}
        >
          <span />
          <span>{keyPlaceholder}</span>
          <span>{valuePlaceholder}</span>
          <span />
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        {items.map((item, index) => (
          <div
            key={index}
            className="grid gap-1 items-center"
            style={{ gridTemplateColumns: '20px 1fr 1fr 24px' }}
          >
            <input
              type="checkbox"
              checked={item.enabled}
              onChange={(e) => updateRow(index, 'enabled', e.target.checked)}
              className="cursor-pointer w-3.5 h-3.5 justify-self-center accent-accent"
            />
            <input
              type="text"
              value={item.key}
              onChange={(e) => updateRow(index, 'key', e.target.value)}
              placeholder={keyPlaceholder}
              className={[
                'bg-bg-surface border border-transparent rounded text-text px-2 py-1.5 text-xs font-mono outline-none w-full transition-colors',
                'hover:border-bg-hover focus:border-accent focus:bg-bg-alt placeholder:text-text-faint font-medium',
                !item.enabled && 'opacity-40',
              ]
                .filter(Boolean)
                .join(' ')}
            />
            <input
              type="text"
              value={item.value}
              onChange={(e) => updateRow(index, 'value', e.target.value)}
              placeholder={valuePlaceholder}
              className={[
                'bg-bg-surface border border-transparent rounded text-text px-2 py-1.5 text-xs font-mono outline-none w-full transition-colors',
                'hover:border-bg-hover focus:border-accent focus:bg-bg-alt placeholder:text-text-faint',
                !item.enabled && 'opacity-40',
              ]
                .filter(Boolean)
                .join(' ')}
            />
            <button
              className="bg-transparent border-none text-text-faint cursor-pointer p-0.5 text-[11px] rounded leading-none justify-self-center transition-colors hover:bg-red/10 hover:text-red"
              onClick={() => removeRow(index)}
              title="Remove"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        className="bg-transparent border border-dashed border-text-faint rounded text-text-muted cursor-pointer px-2.5 py-1.5 text-xs text-left mt-1.5 transition-colors hover:border-accent hover:text-accent"
        onClick={addRow}
      >
        + Add row
      </button>
    </div>
  );
}
