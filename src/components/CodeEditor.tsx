import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { useCallback, useMemo } from 'react';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: 'json' | 'text';
  readOnly?: boolean;
  placeholder?: string;
  minHeight?: string;
}

/** Attempt to pretty-print a JSON string; return original if it fails. */
export function tryPrettify(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

/** Return a human-readable JSON parse error, or null if the string is valid JSON. */
function jsonError(raw: string): string | null {
  if (!raw.trim()) return null;
  try {
    JSON.parse(raw);
    return null;
  } catch (e) {
    return (e as Error).message;
  }
}

const baseTheme = EditorView.theme({
  '&': {
    fontSize: '12px',
    fontFamily: 'var(--font-mono)',
    flex: '1',
    minHeight: '0',
    height: '100%',
  },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { fontFamily: 'inherit', overflow: 'auto' },
  '.cm-content': { padding: '10px 12px', caretColor: 'var(--color-text)' },
  '.cm-gutters': {
    background: 'var(--color-bg-alt)',
    color: 'var(--color-text-faint)',
    border: 'none',
    borderRight: '1px solid var(--color-border)',
  },
  '.cm-activeLineGutter': { background: 'var(--color-bg-hover)' },
  '.cm-activeLine': { background: 'rgba(99,102,241,0.05)' },
  '.cm-cursor': { borderLeftColor: 'var(--color-accent)' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    background: 'var(--color-bg-active) !important',
  },
  '.cm-tooltip': { background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)' },
});

export function CodeEditor({
  value,
  onChange,
  language = 'text',
  readOnly = false,
  placeholder,
  minHeight = '200px',
}: CodeEditorProps) {
  const extensions = useMemo(
    () => [baseTheme, ...(language === 'json' ? [json()] : [])],
    [language],
  );

  const handleChange = useCallback(
    (val: string) => {
      onChange?.(val);
    },
    [onChange],
  );

  const err = !readOnly && language === 'json' ? jsonError(value) : null;

  return (
    <div
      className="flex flex-col overflow-hidden rounded-md border border-border focus-within:border-accent"
      style={{ minHeight, flex: 1 }}
    >
      {/* Toolbar: beautify + live validation indicator (only for writable JSON editors) */}
      {!readOnly && language === 'json' && (
        <div className="flex items-center gap-2 px-2 py-1 bg-bg-alt border-b border-border flex-shrink-0">
          <button
            className="text-[11px] text-text-muted hover:text-accent px-1.5 py-0.5 rounded transition-colors bg-transparent border-none cursor-pointer"
            onClick={() => onChange?.(tryPrettify(value))}
            title="Format JSON"
          >
            ✦ Beautify
          </button>
          {err ? (
            <span
              className="text-[11px] text-red ml-auto truncate max-w-[60%]"
              title={err}
            >
              ⚠ {err}
            </span>
          ) : value.trim() ? (
            <span className="text-[11px] text-green ml-auto">✓ Valid JSON</span>
          ) : null}
        </div>
      )}

      <CodeMirror
        value={value}
        onChange={handleChange}
        extensions={extensions}
        theme={oneDark}
        readOnly={readOnly}
        placeholder={placeholder}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: !readOnly,
          autocompletion: !readOnly,
          indentOnInput: true,
          tabSize: 2,
        }}
        style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}
      />
    </div>
  );
}

/** Read-only JSON viewer with syntax highlighting and a one-click beautify button. */
export function JsonViewer({ value }: { value: string }) {
  const prettyValue = useMemo(() => tryPrettify(value), [value]);
  const extensions = useMemo(() => [baseTheme, json()], []);

  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-border" style={{ flex: 1, minHeight: 0 }}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-2 py-1 bg-bg-alt border-b border-border flex-shrink-0">
        <span className="text-[11px] text-text-muted font-semibold">JSON</span>
        <span className="text-[11px] text-green ml-auto">✓ Prettified</span>
      </div>

      <CodeMirror
        value={prettyValue}
        extensions={extensions}
        theme={oneDark}
        readOnly
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          syntaxHighlighting: true,
          bracketMatching: true,
          tabSize: 2,
        }}
        style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}
      />
    </div>
  );
}
