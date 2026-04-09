import { useState } from 'react';
import type { HttpRequest, BodyType } from '../types';
import { KeyValueEditor } from './KeyValueEditor';

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
    <div className="request-panel">
      <div className="panel-header">
        <span className="panel-label">Request</span>
      </div>
      <div className="panel-tabs">
        {(['params', 'headers', 'body'] as Tab[]).map((t) => (
          <button
            key={t}
            className={`panel-tab${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {counts[t] > 0 && <span className="tab-badge">{counts[t]}</span>}
          </button>
        ))}
      </div>

      <div className="panel-content">
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
          <div className="body-editor">
            <div className="body-type-bar">
              {BODY_TYPES.map((bt) => (
                <button
                  key={bt.value}
                  className={`body-type-btn${request.bodyType === bt.value ? ' active' : ''}`}
                  onClick={() => onChange({ ...request, bodyType: bt.value })}
                >
                  {bt.label}
                </button>
              ))}
            </div>
            {request.bodyType !== 'none' ? (
              <textarea
                className="body-textarea"
                value={request.body}
                onChange={(e) => onChange({ ...request, body: e.target.value })}
                placeholder={
                  request.bodyType === 'json' ? '{\n  "key": "value"\n}' : 'Request body...'
                }
                spellCheck={false}
              />
            ) : (
              <div className="no-body">This request has no body</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
