import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { HotkeysProvider, useHotkeys } from '@tanstack/react-hotkeys';
import type { HttpRequest, HttpResponse, SavedData, RequestGroup } from './types';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { RequestPanel } from './components/RequestPanel';
import { ResponsePanel } from './components/ResponsePanel';
import './App.css';

function newRequest(groupId?: string): HttpRequest {
  return {
    id: crypto.randomUUID(),
    name: '',
    groupId: groupId ?? null,
    method: 'GET',
    url: '',
    headers: [],
    params: [],
    body: '',
    bodyType: 'none',
  };
}

function AppInner() {
  const [savedData, setSavedData] = useState<SavedData>({ groups: [], requests: [] });
  const [current, setCurrent] = useState<HttpRequest>(newRequest());
  const [response, setResponse] = useState<HttpResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    invoke<SavedData>('load_requests').then(setSavedData).catch(console.error);
  }, []);

  const handleSend = useCallback(async () => {
    if (!current.url || isLoading) return;
    setIsLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res = await invoke<HttpResponse>('send_request', { request: current });
      setResponse(res);
    } catch (e) {
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
  }, [current, isLoading]);

  const handleSave = useCallback(async () => {
    try {
      await invoke('save_request', { request: current });
      setSavedData((prev) => {
        const exists = prev.requests.some((r) => r.id === current.id);
        return {
          ...prev,
          requests: exists
            ? prev.requests.map((r) => (r.id === current.id ? current : r))
            : [...prev.requests, current],
        };
      });
    } catch (e) {
      console.error('Save failed:', e);
    }
  }, [current]);

  const handleDeleteRequest = useCallback(
    async (id: string) => {
      try {
        await invoke('delete_request', { id });
        setSavedData((prev) => ({ ...prev, requests: prev.requests.filter((r) => r.id !== id) }));
        if (current.id === id) {
          setCurrent(newRequest());
          setResponse(null);
          setError(null);
        }
      } catch (e) {
        console.error('Delete request failed:', e);
      }
    },
    [current.id],
  );

  const handleCreateGroup = useCallback(async (name: string) => {
    const group: RequestGroup = { id: crypto.randomUUID(), name, collapsed: false };
    try {
      await invoke('save_group', { group });
      setSavedData((prev) => ({ ...prev, groups: [...prev.groups, group] }));
    } catch (e) {
      console.error('Create group failed:', e);
    }
  }, []);

  const handleDeleteGroup = useCallback(async (id: string) => {
    try {
      await invoke('delete_group', { id });
      setSavedData((prev) => ({
        ...prev,
        groups: prev.groups.filter((g) => g.id !== id),
        requests: prev.requests.map((r) => (r.groupId === id ? { ...r, groupId: null } : r)),
      }));
    } catch (e) {
      console.error('Delete group failed:', e);
    }
  }, []);

  const handleToggleGroup = useCallback((id: string) => {
    setSavedData((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => (g.id === id ? { ...g, collapsed: !g.collapsed } : g)),
    }));
  }, []);

  const handleNewRequest = useCallback((groupId?: string) => {
    setCurrent(newRequest(groupId));
    setResponse(null);
    setError(null);
  }, []);

  const handleLoadRequest = useCallback((request: HttpRequest) => {
    setCurrent(request);
    setResponse(null);
    setError(null);
  }, []);

  const isSaved = savedData.requests.some((r) => r.id === current.id);

  // Global hotkeys
  useHotkeys(
    [
      { hotkey: 'Mod+Enter', callback: handleSend },
      { hotkey: 'Mod+S', callback: handleSave },
      { hotkey: 'Mod+N', callback: () => handleNewRequest() },
    ],
    { preventDefault: true },
  );

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text">
      <Sidebar
        savedData={savedData}
        activeRequestId={current.id}
        onLoadRequest={handleLoadRequest}
        onDeleteRequest={handleDeleteRequest}
        onCreateGroup={handleCreateGroup}
        onDeleteGroup={handleDeleteGroup}
        onToggleGroup={handleToggleGroup}
        onNewRequest={handleNewRequest}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar
          request={current}
          onChange={setCurrent}
          onSend={handleSend}
          onSave={handleSave}
          isLoading={isLoading}
          isSaved={isSaved}
        />
        <div className="flex-1 flex overflow-hidden min-h-0">
          <RequestPanel request={current} onChange={setCurrent} />
          <div className="w-px bg-border flex-shrink-0" />
          <ResponsePanel response={response} error={error} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <HotkeysProvider>
      <AppInner />
    </HotkeysProvider>
  );
}

export default App;
