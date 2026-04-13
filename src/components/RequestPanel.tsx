import { useState } from 'react';
import type { HttpRequest, BodyType } from '../types';
import { KeyValueEditor } from './KeyValueEditor';
import { CodeEditor } from './CodeEditor';

interface RequestPanelProps {
  request: HttpRequest;
  onChange: (req: HttpRequest) => void;
}

type Tab = 'params' | 'headers' | 'body';

const BODY_TYPES: { value: BodyType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'json', label: 'JSON' },
  { value: 'form', label: 'Form' },
  { value: 'raw', label: 'Raw' },
];

export function RequestPanel({ request, onChange }: RequestPanelProps) {
  const [tab, setTab] = useState<Tab>('params');

  const counts: Record<Tab, number> = {
    params: request.params.filter((p) => p.enabled && p.key).length,
    headers: request.headers.filter((h) => h.enabled && h.key).length,
    body: request.bodyType !== 'none' && request.body ? 1 : 0,
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      {/* Panel header */}
      <div className="px-3 py-2 border-b border-border flex items-center gap-2 flex-shrink-0 min-h-[38px]">
        <span className="text-[11px] font-semibold tracking-widest uppercase text-text-muted">
          Request
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border flex-shrink-0 px-3 gap-0.5">
        {(['params', 'headers', 'body'] as Tab[]).map((t) => (
          <button
            key={t}
            className={[
              'bg-transparent border-none border-b-2 py-2 px-2.5 text-xs cursor-pointer flex items-center gap-1.5 transition-colors -mb-px',
              tab === t
                ? 'text-accent border-accent'
                : 'text-text-muted border-transparent hover:text-text',
            ].join(' ')}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {counts[t] > 0 && (
              <span
                className={[
                  'text-[10px] px-1.5 py-px rounded-full min-w-4 text-center',
                  tab === t ? 'bg-accent/20 text-accent' : 'bg-bg-active text-text-muted',
                ].join(' ')}
              >
                {counts[t]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 flex flex-col min-h-0">
        {tab === 'params' && (
          <KeyValueEditor
            items={request.params}
            onChange={(params) => onChange({ ...request, params })}
            keyPlaceholder="Parameter"
            valuePlaceholder="Value"
          />
        )}

        {tab === 'headers' && (
          <KeyValueEditor
            items={request.headers}
            onChange={(headers) => onChange({ ...request, headers })}
            keyPlaceholder="Header"
            valuePlaceholder="Value"
          />
        )}

        {tab === 'body' && (
          <div className="flex flex-col gap-2 flex-1 min-h-0">
            {/* Body type selector */}
            <div className="flex gap-1 flex-shrink-0">
              {BODY_TYPES.map((bt) => (
                <button
                  key={bt.value}
                  className={[
                    'border rounded text-xs cursor-pointer px-2.5 py-1 transition-all font-medium',
                    request.bodyType === bt.value
                      ? 'bg-accent border-accent text-[#1e1e2e] font-semibold'
                      : 'bg-transparent border-border text-text-muted hover:bg-bg-hover hover:text-text',
                  ].join(' ')}
                  onClick={() => onChange({ ...request, bodyType: bt.value })}
                >
                  {bt.label}
                </button>
              ))}
            </div>

            {/* Body editor */}
            {request.bodyType !== 'none' ? (
              <CodeEditor
                value={request.body}
                onChange={(body) => onChange({ ...request, body })}
                language={request.bodyType === 'json' ? 'json' : 'text'}
                placeholder={
                  request.bodyType === 'json' ? '{\n  "key": "value"\n}' : 'Request body…'
                }
                minHeight="200px"
              />
            ) : (
              <div className="p-5 text-text-faint text-xs text-center">
                This request has no body
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
