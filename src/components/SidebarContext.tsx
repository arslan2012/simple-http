import { createContext, useContext } from 'react';
import type { HttpRequest, SavedData } from '../types';

export interface SidebarContextValue {
  savedData: SavedData;
  activeRequestId: string | null;
  onLoadRequest: (request: HttpRequest) => void;
  onDeleteRequest: (id: string) => void;
  onDuplicateRequest: (request: HttpRequest) => void;
  onCreateGroup: (name: string) => void;
  onDeleteGroup: (id: string) => void;
  onToggleGroup: (id: string) => void;
  onNewRequest: (groupId?: string) => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export const SidebarProvider = SidebarContext.Provider;

export function useSidebarContext(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebarContext must be used within SidebarProvider');
  return ctx;
}
