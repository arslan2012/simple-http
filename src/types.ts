export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
export type BodyType = 'none' | 'json' | 'form' | 'raw';

export interface KeyValue {
  key: string;
  value: string;
  enabled: boolean;
}

export interface HttpRequest {
  id: string;
  name: string;
  groupId: string | null;
  method: HttpMethod;
  url: string;
  headers: KeyValue[];
  params: KeyValue[];
  body: string;
  bodyType: BodyType;
}

export interface RequestGroup {
  id: string;
  name: string;
  collapsed: boolean;
}

export interface SavedData {
  groups: RequestGroup[];
  requests: HttpRequest[];
}

export interface HttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  durationMs: number;
  size: number;
}
