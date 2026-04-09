import { useState } from 'react';
import type { HttpResponse } from '../types';

interface ResponsePanelProps {
  response: HttpResponse | null;
  error: string | null;
  isLoading: boolean;
}

type Tab = 'body' | 'headers';

function statusClass(status: number) {
  if (status < 300) return 'status-2xx';
  if (status < 400) return 'status-3xx';
  if (status < 500) return 'status-4xx';
  return 'status-5xx';
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function prettyBody(body: string, headers: Record<string, string>) {
  const ct = headers['content-type'] ?? '';
  if (ct.includes('json')) {
    try {
      return JSON.stringify(JSON.parse(body), null, 2);
    } catch {
      return body;
    }
  }
  return body;
}

export function ResponsePanel({ response, error, isLoading }: ResponsePanelProps) {
  const [tab, setTab] = useState<Tab>('body');

  if (isLoading) {
    return (
      <div className="response-panel">
        <div className="panel-header">
          <span className="panel-label">Response</span>
        </div>
        <div className="response-empty">
          <div className="loading-ring" />
          <p>Sending request…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="response-panel">
        <div className="panel-header">
          <span className="panel-label">Response</span>
        </div>
        <div className="response-empty error-state">
          <div className="error-icon">⚠</div>
          <p className="error-title">Request failed</p>
          <p className="error-msg">{error}</p>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="response-panel">
        <div className="panel-header">
          <span className="panel-label">Response</span>
        </div>
        <div className="response-empty">
          <div className="response-idle-icon">🚀</div>
          <p>Enter a URL and hit Send</p>
        </div>
      </div>
    );
  }

  const headerEntries = Object.entries(response.headers);
  const body = prettyBody(response.body, response.headers);

  return (
    <div className="response-panel">
      <div className="panel-header response-status-bar">
        <span className={`status-badge ${statusClass(response.status)}`}>
          {response.status} {response.statusText}
        </span>
        <span className="response-meta">{response.durationMs} ms</span>
        <span className="response-meta">{formatSize(response.size)}</span>
      </div>

      <div className="panel-tabs">
        {(['body', 'headers'] as Tab[]).map((t) => (
          <button
            key={t}
            className={`panel-tab${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'headers' && <span className="tab-badge">{headerEntries.length}</span>}
          </button>
        ))}
      </div>

      <div className="panel-content">
        {tab === 'body' && (
          <pre className="response-body">{body || <span className="empty-body">(empty body)</span>}</pre>
        )}
        {tab === 'headers' && (
          <div className="response-headers">
            {headerEntries.map(([key, value]) => (
              <div key={key} className="header-row">
                <span className="header-key">{key}</span>
                <span className="header-value">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
