import { useState } from 'react';
import type { HttpResponse } from '../types';
import { CodeEditor, JsonViewer } from './CodeEditor';

interface ResponsePanelProps {
  response: HttpResponse | null;
  error: string | null;
  isLoading: boolean;
}

type Tab = 'body' | 'headers';

function statusClass(status: number) {
  if (status < 300) return 'bg-green/10 text-green';
  if (status < 400) return 'bg-yellow/10 text-yellow';
  if (status < 500) return 'bg-red/10 text-red';
  return 'bg-mauve/10 text-mauve';
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function isJsonContentType(headers: Record<string, string>) {
  const ct = headers['content-type'] ?? '';
  return ct.includes('json');
}

const PanelShell = ({ children }: { children: React.ReactNode }) => (
  <div className="flex-1 flex flex-col overflow-hidden min-w-0">{children}</div>
);

const PanelHeader = ({ label }: { label: string }) => (
  <div className="px-3 py-2 border-b border-border flex items-center gap-2 flex-shrink-0 min-h-[38px]">
    <span className="text-[11px] font-semibold tracking-widest uppercase text-text-muted">
      {label}
    </span>
  </div>
);

export function ResponsePanel({ response, error, isLoading }: ResponsePanelProps) {
  const [tab, setTab] = useState<Tab>('body');

  if (isLoading) {
    return (
      <PanelShell>
        <PanelHeader label="Response" />
        <div className="flex-1 flex flex-col items-center justify-center gap-2.5 text-text-muted text-[13px] p-8">
          <div
            className="w-7 h-7 border-[3px] border-bg-hover border-t-accent rounded-full"
            style={{ animation: 'spin 0.8s linear infinite' }}
          />
          <p>Sending request…</p>
        </div>
      </PanelShell>
    );
  }

  if (error) {
    return (
      <PanelShell>
        <PanelHeader label="Response" />
        <div className="flex-1 flex flex-col items-center justify-center gap-2.5 text-red p-8">
          <div className="text-3xl">⚠</div>
          <p className="font-semibold text-sm">Request failed</p>
          <p className="text-xs font-mono text-center max-w-sm text-text-muted break-all">{error}</p>
        </div>
      </PanelShell>
    );
  }

  if (!response) {
    return (
      <PanelShell>
        <PanelHeader label="Response" />
        <div className="flex-1 flex flex-col items-center justify-center gap-2.5 text-text-muted text-[13px] p-8">
          <div className="text-4xl">🚀</div>
          <p>Enter a URL and hit Send</p>
        </div>
      </PanelShell>
    );
  }

  const headerEntries = Object.entries(response.headers);
  const showJsonViewer = isJsonContentType(response.headers);

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      {/* Status bar */}
      <div className="px-3 py-2 border-b border-border flex items-center gap-3 flex-wrap flex-shrink-0 min-h-[38px]">
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${statusClass(response.status)}`}>
          {response.status} {response.statusText}
        </span>
        <span className="text-xs text-text-muted">{response.durationMs} ms</span>
        <span className="text-xs text-text-muted">{formatSize(response.size)}</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border flex-shrink-0 px-3 gap-0.5">
        {(['body', 'headers'] as Tab[]).map((t) => (
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
            {t === 'headers' && (
              <span className="text-[10px] bg-bg-active text-text-muted px-1.5 py-px rounded-full min-w-4 text-center">
                {headerEntries.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 flex flex-col min-h-0">
        {tab === 'body' && (
          showJsonViewer ? (
            <JsonViewer value={response.body} />
          ) : (
            <CodeEditor
              value={response.body}
              language="text"
              readOnly
              minHeight="100px"
            />
          )
        )}
        {tab === 'headers' && (
          <div className="flex flex-col gap-1">
            {headerEntries.map(([key, value]) => (
              <div
                key={key}
                className="grid gap-2 text-xs p-1.5 rounded bg-bg-surface"
                style={{ gridTemplateColumns: '1fr 1.5fr' }}
              >
                <span className="font-mono text-accent font-semibold overflow-hidden text-ellipsis whitespace-nowrap">
                  {key}
                </span>
                <span className="text-text overflow-hidden text-ellipsis whitespace-nowrap">
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
