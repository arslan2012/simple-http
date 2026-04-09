import type { HttpRequest, HttpMethod } from '../types';

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

export function TopBar({ request, onChange, onSend, onSave, isLoading, isSaved }: TopBarProps) {
  return (
    <div className="top-bar">
      <input
        type="text"
        className="request-name-input"
        value={request.name}
        onChange={(e) => onChange({ ...request, name: e.target.value })}
        placeholder="Request name..."
      />
      <div className="url-row">
        <select
          className="method-select"
          value={request.method}
          onChange={(e) => onChange({ ...request, method: e.target.value as HttpMethod })}
          style={{ color: METHOD_COLORS[request.method] }}
        >
          {HTTP_METHODS.map((m) => (
            <option key={m} value={m} style={{ color: METHOD_COLORS[m] }}>
              {m}
            </option>
          ))}
        </select>
        <input
          type="text"
          className="url-input"
          value={request.url}
          onChange={(e) => onChange({ ...request, url: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && !isLoading && request.url && onSend()}
          placeholder="https://api.example.com/endpoint"
          spellCheck={false}
        />
        <button className="send-btn" onClick={onSend} disabled={isLoading || !request.url}>
          {isLoading ? (
            <span className="btn-spinner" />
          ) : (
            'Send'
          )}
        </button>
        <button className={`save-btn${isSaved ? ' saved' : ''}`} onClick={onSave}>
          {isSaved ? 'Update' : 'Save'}
        </button>
      </div>
    </div>
  );
}
