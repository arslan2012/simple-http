import { useState } from 'react';
import type { HttpRequest, RequestGroup } from '../types';
import { ContextMenu, type ContextMenuItem } from './ContextMenu';
import { useSidebarContext } from './SidebarContext';

const METHOD_COLORS: Record<string, string> = {
  GET: '#89b4fa',
  POST: '#a6e3a1',
  PUT: '#f9e2af',
  PATCH: '#cba6f7',
  DELETE: '#f38ba8',
  HEAD: '#89dceb',
  OPTIONS: '#89dceb',
};

export function Sidebar() {
  const {
    savedData,
    onCreateGroup,
    onNewRequest,
  } = useSidebarContext();
  const [newGroupName, setNewGroupName] = useState('');
  const [showNewGroup, setShowNewGroup] = useState(false);

  const ungroupedRequests = savedData.requests.filter((r) => !r.groupId);

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName.trim());
      setNewGroupName('');
      setShowNewGroup(false);
    }
  };

  return (
    <aside className="w-60 flex-shrink-0 bg-bg-alt border-r border-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border flex-shrink-0">
        <span className="text-[11px] font-semibold tracking-widest uppercase text-text-muted">
          Collections
        </span>
        <div className="flex gap-1">
          <button
            className="bg-transparent border-none text-text-muted cursor-pointer px-1.5 py-0.5 rounded text-sm leading-none transition-colors hover:bg-bg-hover hover:text-text"
            onClick={() => setShowNewGroup((v) => !v)}
            title="New Group (⌘G)"
          >
            ⊞
          </button>
          <button
            className="bg-transparent border-none text-text-muted cursor-pointer px-1.5 py-0.5 rounded text-sm leading-none transition-colors hover:bg-bg-hover hover:text-text"
            onClick={() => onNewRequest()}
            title="New Request (⌘N)"
          >
            +
          </button>
        </div>
      </div>

      {/* New group input */}
      {showNewGroup && (
        <div className="flex gap-1 p-2 border-b border-border flex-shrink-0">
          <input
            type="text"
            className="flex-1 bg-bg-surface border border-border rounded text-text px-2 py-1 text-xs outline-none focus:border-accent"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateGroup();
              if (e.key === 'Escape') setShowNewGroup(false);
            }}
            placeholder="Group name…"
            autoFocus
          />
          <button
            className="bg-transparent border-none text-text-muted cursor-pointer px-1.5 py-0.5 rounded text-sm leading-none transition-colors hover:bg-green/10 hover:text-green"
            onClick={handleCreateGroup}
          >
            ✓
          </button>
          <button
            className="bg-transparent border-none text-text-muted cursor-pointer px-1.5 py-0.5 rounded text-sm leading-none transition-colors hover:bg-red/10 hover:text-red"
            onClick={() => setShowNewGroup(false)}
          >
            ✕
          </button>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto py-1">
        {savedData.groups.map((group) => (
          <GroupItem
            key={group.id}
            group={group}
            requests={savedData.requests.filter((r) => r.groupId === group.id)}
          />
        ))}

        {ungroupedRequests.map((req) => (
          <RequestItem
            key={req.id}
            request={req}
          />
        ))}

        {savedData.groups.length === 0 && ungroupedRequests.length === 0 && (
          <div className="px-4 py-8 text-center text-text-muted text-xs">
            <div className="text-3xl mb-2">📭</div>
            <p>No saved requests</p>
            <p className="text-text-faint mt-1 text-[11px]">Click + to create one</p>
          </div>
        )}
      </div>
    </aside>
  );
}

interface GroupItemProps {
  group: RequestGroup;
  requests: HttpRequest[];
}

function GroupItem({ group, requests }: GroupItemProps) {
  const { onToggleGroup, onDeleteGroup, onNewRequest } = useSidebarContext();
  const [hovered, setHovered] = useState(false);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);

  const ctxItems: ContextMenuItem[] = [
    { id: 'add', label: 'Add Request', onAction: () => onNewRequest(group.id) },
    { id: 'delete', label: 'Delete Group', onAction: () => onDeleteGroup(group.id), danger: true },
  ];

  return (
    <div
      className="select-none"
      onContextMenu={(e) => {
        e.preventDefault();
        setCtxMenu({ x: e.clientX, y: e.clientY });
      }}
    >
      <div
        className="flex items-center pr-1"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <button
          className="flex-1 flex items-center gap-1.5 px-2 py-1.5 bg-transparent border-none text-text cursor-pointer text-xs font-medium text-left rounded min-w-0 hover:bg-bg-hover"
          onClick={() => onToggleGroup(group.id)}
        >
          <span className="text-[9px] text-text-muted flex-shrink-0">
            {group.collapsed ? '▶' : '▼'}
          </span>
          <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{group.name}</span>
          <span className="text-[10px] bg-bg-active text-text-muted px-1.5 py-px rounded-full flex-shrink-0">
            {requests.length}
          </span>
        </button>
        <div
          className="flex gap-0.5 transition-opacity"
          style={{ opacity: hovered ? 1 : 0 }}
        >
          <button
            className="bg-transparent border-none text-text-muted cursor-pointer px-1 py-0.5 rounded text-[11px] leading-none transition-colors hover:bg-bg-hover hover:text-text"
            onClick={(e) => {
              e.stopPropagation();
              onNewRequest(group.id);
            }}
            title="Add request to group"
          >
            +
          </button>
          <button
            className="bg-transparent border-none text-text-muted cursor-pointer px-1 py-0.5 rounded text-[11px] leading-none transition-colors hover:bg-red/10 hover:text-red"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteGroup(group.id);
            }}
            title="Delete group"
          >
            ✕
          </button>
        </div>
      </div>

      {!group.collapsed && (
        <div>
          {requests.map((req) => (
            <RequestItem
              key={req.id}
              request={req}
              indented
            />
          ))}
          {requests.length === 0 && (
            <div className="py-1 pl-6 text-[11px] text-text-faint">No requests</div>
          )}
        </div>
      )}

      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          items={ctxItems}
          onClose={() => setCtxMenu(null)}
        />
      )}
    </div>
  );
}

interface RequestItemProps {
  request: HttpRequest;
  indented?: boolean;
}

function RequestItem({ request, indented }: RequestItemProps) {
  const { activeRequestId, onLoadRequest, onDeleteRequest, onDuplicateRequest } = useSidebarContext();
  const isActive = request.id === activeRequestId;
  const [hovered, setHovered] = useState(false);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);
  const color = METHOD_COLORS[request.method] ?? '#abb2bf';

  const onLoad = () => onLoadRequest(request);
  const onDelete = () => onDeleteRequest(request.id);
  const onDuplicate = () => onDuplicateRequest(request);

  const ctxItems: ContextMenuItem[] = [
    { id: 'open', label: 'Open', onAction: onLoad },
    { id: 'duplicate', label: 'Duplicate', onAction: onDuplicate },
    { id: 'delete', label: 'Delete', onAction: onDelete, danger: true },
  ];

  return (
    <>
      <div
        className={[
          'flex items-center gap-1.5 py-1.5 cursor-pointer rounded mx-1 min-w-0 select-none transition-colors',
          indented ? 'pl-5 pr-2' : 'px-2',
          isActive ? 'bg-bg-active' : 'hover:bg-bg-hover',
        ].join(' ')}
        onClick={onLoad}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onContextMenu={(e) => {
          e.preventDefault();
          setCtxMenu({ x: e.clientX, y: e.clientY });
        }}
      >
        <span className="text-[10px] font-bold flex-shrink-0 w-[46px] text-left" style={{ color }}>
          {request.method}
        </span>
        <span className="flex-1 text-xs overflow-hidden text-ellipsis whitespace-nowrap text-text">
          {request.name || request.url || 'Untitled'}
        </span>
        {hovered && (
          <button
            className="bg-transparent border-none text-text-faint cursor-pointer p-0.5 text-[11px] rounded leading-none transition-colors hover:bg-red/10 hover:text-red"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete"
          >
            ✕
          </button>
        )}
      </div>

      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          items={ctxItems}
          onClose={() => setCtxMenu(null)}
        />
      )}
    </>
  );
}
