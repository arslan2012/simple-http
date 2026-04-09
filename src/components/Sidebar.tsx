import { useState } from 'react';
import type { HttpRequest, RequestGroup, SavedData } from '../types';

interface SidebarProps {
  savedData: SavedData;
  activeRequestId: string | null;
  onLoadRequest: (request: HttpRequest) => void;
  onDeleteRequest: (id: string) => void;
  onCreateGroup: (name: string) => void;
  onDeleteGroup: (id: string) => void;
  onToggleGroup: (id: string) => void;
  onNewRequest: (groupId?: string) => void;
}

const METHOD_COLORS: Record<string, string> = {
  GET: '#89b4fa',
  POST: '#a6e3a1',
  PUT: '#f9e2af',
  PATCH: '#cba6f7',
  DELETE: '#f38ba8',
  HEAD: '#89dceb',
  OPTIONS: '#89dceb',
};

export function Sidebar({
  savedData,
  activeRequestId,
  onLoadRequest,
  onDeleteRequest,
  onCreateGroup,
  onDeleteGroup,
  onToggleGroup,
  onNewRequest,
}: SidebarProps) {
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
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">Collections</span>
        <div className="sidebar-header-actions">
          <button
            className="sidebar-icon-btn"
            onClick={() => setShowNewGroup((v) => !v)}
            title="New Group"
          >
            ⊞
          </button>
          <button
            className="sidebar-icon-btn"
            onClick={() => onNewRequest()}
            title="New Request"
          >
            +
          </button>
        </div>
      </div>

      {showNewGroup && (
        <div className="new-group-form">
          <input
            type="text"
            className="new-group-input"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateGroup();
              if (e.key === 'Escape') setShowNewGroup(false);
            }}
            placeholder="Group name..."
            autoFocus
          />
          <button className="sidebar-icon-btn confirm" onClick={handleCreateGroup}>
            ✓
          </button>
          <button className="sidebar-icon-btn cancel" onClick={() => setShowNewGroup(false)}>
            ✕
          </button>
        </div>
      )}

      <div className="sidebar-list">
        {savedData.groups.map((group) => (
          <GroupItem
            key={group.id}
            group={group}
            requests={savedData.requests.filter((r) => r.groupId === group.id)}
            activeRequestId={activeRequestId}
            onLoadRequest={onLoadRequest}
            onDeleteRequest={onDeleteRequest}
            onToggleGroup={onToggleGroup}
            onDeleteGroup={onDeleteGroup}
            onNewRequest={onNewRequest}
          />
        ))}

        {ungroupedRequests.map((req) => (
          <RequestItem
            key={req.id}
            request={req}
            isActive={req.id === activeRequestId}
            onLoad={() => onLoadRequest(req)}
            onDelete={() => onDeleteRequest(req.id)}
          />
        ))}

        {savedData.groups.length === 0 && ungroupedRequests.length === 0 && (
          <div className="sidebar-empty">
            <div className="sidebar-empty-icon">📭</div>
            <p>No saved requests</p>
            <p className="sidebar-empty-hint">Click + to create one</p>
          </div>
        )}
      </div>
    </aside>
  );
}

interface GroupItemProps {
  group: RequestGroup;
  requests: HttpRequest[];
  activeRequestId: string | null;
  onLoadRequest: (r: HttpRequest) => void;
  onDeleteRequest: (id: string) => void;
  onToggleGroup: (id: string) => void;
  onDeleteGroup: (id: string) => void;
  onNewRequest: (groupId?: string) => void;
}

function GroupItem({
  group,
  requests,
  activeRequestId,
  onLoadRequest,
  onDeleteRequest,
  onToggleGroup,
  onDeleteGroup,
  onNewRequest,
}: GroupItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="group-item">
      <div
        className="group-header"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <button className="group-toggle-btn" onClick={() => onToggleGroup(group.id)}>
          <span className="group-chevron">{group.collapsed ? '▶' : '▼'}</span>
          <span className="group-name">{group.name}</span>
          <span className="group-count">{requests.length}</span>
        </button>
        <div className="group-actions" style={{ opacity: hovered ? 1 : 0 }}>
          <button
            className="sidebar-icon-btn xs"
            onClick={(e) => {
              e.stopPropagation();
              onNewRequest(group.id);
            }}
            title="Add request to group"
          >
            +
          </button>
          <button
            className="sidebar-icon-btn xs danger"
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
        <div className="group-children">
          {requests.map((req) => (
            <RequestItem
              key={req.id}
              request={req}
              isActive={req.id === activeRequestId}
              onLoad={() => onLoadRequest(req)}
              onDelete={() => onDeleteRequest(req.id)}
              indented
            />
          ))}
          {requests.length === 0 && <div className="empty-group-hint">No requests</div>}
        </div>
      )}
    </div>
  );
}

interface RequestItemProps {
  request: HttpRequest;
  isActive: boolean;
  onLoad: () => void;
  onDelete: () => void;
  indented?: boolean;
}

function RequestItem({ request, isActive, onLoad, onDelete, indented }: RequestItemProps) {
  const [hovered, setHovered] = useState(false);
  const color = METHOD_COLORS[request.method] ?? '#abb2bf';

  return (
    <div
      className={`request-item${isActive ? ' active' : ''}${indented ? ' indented' : ''}`}
      onClick={onLoad}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="request-method" style={{ color }}>
        {request.method}
      </span>
      <span className="request-name">{request.name || request.url || 'Untitled'}</span>
      {hovered && (
        <button
          className="sidebar-icon-btn xs danger"
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
  );
}
