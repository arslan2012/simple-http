import { useState, useEffect, useRef } from 'react';
import type { HttpRequest, HttpMethod, KeyValue } from '../types';

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: '#89b4fa',
  POST: '#a6e3a1',
  PUT: '#f9e2af',
  PATCH: '#cba6f7',
  DELETE: '#f38ba8',
  HEAD: '#89dceb',
  OPTIONS: '#89dceb',
};

interface TopBarProps {
  request: HttpRequest;
  onChange: (req: HttpRequest) => void;
  onSend: () => void;
  onSave: () => void;
  isLoading: boolean;
  isSaved: boolean;
}

/** Build the address-bar string from a base URL and the enabled params. */
function buildDisplayUrl(url: string, params: KeyValue[]): string {
  const enabled = params.filter((p) => p.enabled && p.key);
  if (enabled.length === 0) return url;
  const qs = enabled.map((p) => `${p.key}=${p.value}`).join('&');
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}${qs}`;
}

/**
 * Parse an address-bar string back into a base URL and params.
 * Disabled params from the existing list are preserved unchanged.
 */
function parseDisplayUrl(
  displayUrl: string,
  existingParams: KeyValue[],
): { url: string; params: KeyValue[] } {
  const qIdx = displayUrl.indexOf('?');
  if (qIdx === -1) {
    return { url: displayUrl, params: existingParams.filter((p) => !p.enabled) };
  }
  const url = displayUrl.slice(0, qIdx);
  const qs = displayUrl.slice(qIdx + 1);
  const parsedParams: KeyValue[] = qs
    .split('&')
    .filter(Boolean)
    .map((part) => {
      const eqIdx = part.indexOf('=');
      if (eqIdx === -1) return { key: part, value: '', enabled: true };
      return { key: part.slice(0, eqIdx), value: part.slice(eqIdx + 1), enabled: true };
    });
  const disabledParams = existingParams.filter((p) => !p.enabled);
  return { url, params: [...parsedParams, ...disabledParams] };
}

export function TopBar({ request, onChange, onSend, onSave, isLoading, isSaved }: TopBarProps) {
  const [urlValue, setUrlValue] = useState(() => buildDisplayUrl(request.url, request.params));
  const [isFocused, setIsFocused] = useState(false);
  const prevIdRef = useRef(request.id);

  // Sync the address bar when the active request changes or when external params update
  useEffect(() => {
    const idChanged = prevIdRef.current !== request.id;
    prevIdRef.current = request.id;
    // Always sync on request switch; only sync while unfocused for in-place param edits
    if (idChanged || !isFocused) {
      setUrlValue(buildDisplayUrl(request.url, request.params));
    }
  }, [request.id, request.url, request.params, isFocused]);

  function handleUrlChange(value: string) {
    setUrlValue(value);
    // Keep the base URL portion up-to-date in real time so the request
    // object reflects the host even before the user commits the full URL.
    const qIdx = value.indexOf('?');
    const baseUrl = qIdx === -1 ? value : value.slice(0, qIdx);
    if (baseUrl !== request.url) {
      onChange({ ...request, url: baseUrl });
    }
  }

  function handleUrlCommit() {
    setIsFocused(false);
    const { url, params } = parseDisplayUrl(urlValue, request.params);
    onChange({ ...request, url, params });
  }

  return (
    <div className="bg-bg border-b border-border px-3 py-2 flex flex-col gap-1.5 flex-shrink-0">
      <input
        type="text"
        className="bg-transparent border-none text-text-muted text-xs outline-none w-72 placeholder:text-text-faint focus:text-text"
        value={request.name}
        onChange={(e) => onChange({ ...request, name: e.target.value })}
        placeholder="Request name…"
      />
      <div className="flex gap-1.5 items-center">
        <select
          className="bg-bg-alt border border-border rounded-md text-xs font-bold outline-none cursor-pointer flex-shrink-0 px-2 py-1.5 focus:border-accent"
          value={request.method}
          onChange={(e) => onChange({ ...request, method: e.target.value as HttpMethod })}
          style={{ color: METHOD_COLORS[request.method] }}
        >
          {HTTP_METHODS.map((m) => (
            <option key={m} value={m} style={{ color: METHOD_COLORS[m], background: '#181825' }}>
              {m}
            </option>
          ))}
        </select>

        <input
          type="text"
          className="flex-1 bg-bg-alt border border-border rounded-md text-text px-2.5 py-1.5 text-[13px] font-mono outline-none min-w-0 focus:border-accent placeholder:text-text-faint"
          value={urlValue}
          onChange={(e) => handleUrlChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleUrlCommit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleUrlCommit();
              if (!isLoading && request.url) onSend();
            }
          }}
          placeholder="https://api.example.com/endpoint"
          spellCheck={false}
        />

        <button
          className="bg-accent text-bg border-none rounded-md px-5 py-1.5 text-[13px] font-semibold cursor-pointer flex-shrink-0 flex items-center gap-1.5 transition-opacity hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={onSend}
          disabled={isLoading || !request.url}
          title="Send (⌘↵)"
        >
          {isLoading ? (
            <span
              className="w-3 h-3 border-2 border-bg/30 border-t-bg rounded-full inline-block"
              style={{ animation: 'spin 0.7s linear infinite' }}
            />
          ) : (
            'Send'
          )}
        </button>

        <button
          className={[
            'bg-bg-alt border rounded-md px-4 py-1.5 text-[13px] cursor-pointer flex-shrink-0 transition-all',
            isSaved
              ? 'border-green text-green hover:bg-green/10'
              : 'border-border text-text-muted hover:bg-bg-hover hover:text-text',
          ].join(' ')}
          onClick={onSave}
          title="Save (⌘S)"
        >
          {isSaved ? 'Update' : 'Save'}
        </button>
      </div>
    </div>
  );
}
