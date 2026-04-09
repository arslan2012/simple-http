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
    <div className="kv-editor">
      {items.length > 0 && (
        <div className="kv-header">
          <span className="kv-col-check" />
          <span className="kv-col-key">{keyPlaceholder}</span>
          <span className="kv-col-value">{valuePlaceholder}</span>
          <span className="kv-col-action" />
        </div>
      )}
      <div className="kv-rows">
        {items.map((item, index) => (
          <div key={index} className={`kv-row${!item.enabled ? ' disabled' : ''}`}>
            <input
              type="checkbox"
              checked={item.enabled}
              onChange={(e) => updateRow(index, 'enabled', e.target.checked)}
              className="kv-checkbox"
            />
            <input
              type="text"
              value={item.key}
              onChange={(e) => updateRow(index, 'key', e.target.value)}
              placeholder={keyPlaceholder}
              className="kv-input kv-key"
            />
            <input
              type="text"
              value={item.value}
              onChange={(e) => updateRow(index, 'value', e.target.value)}
              placeholder={valuePlaceholder}
              className="kv-input kv-value"
            />
            <button className="kv-remove" onClick={() => removeRow(index)} title="Remove">
              ✕
            </button>
          </div>
        ))}
      </div>
      <button className="kv-add-btn" onClick={addRow}>
        + Add row
      </button>
    </div>
  );
}
