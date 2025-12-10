export enum UserRole {
  ADMIN = 'ADMIN',
  ANALYST = 'ANALYST',
  VIEWER = 'VIEWER'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
}

export enum EventSource {
  EDR = 'EDR',
  NDR = 'NDR'
}

export enum Severity {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
  INFO = 'Info'
}

// The unified schema that external vendors map to
export interface UnifiedEvent {
  id: string;
  timestamp: string; // ISO string
  source: EventSource;
  vendor: string; // e.g., "CrowdStrike", "Corelight"
  eventType: string; // e.g., "ProcessCreate", "DNSQuery"
  severity: Severity;
  description: string;
  sourceIp?: string;
  destIp?: string;
  processName?: string;
  filePath?: string;
  user?: string;
  traceId?: string; // For linking events in topology
  rawPayload?: string; // Original JSON
}

export interface Incident {
  id: string;
  title: string;
  status: 'Open' | 'Investigating' | 'Resolved';
  severity: Severity;
  events: UnifiedEvent[];
  assignee?: string;
  summary?: string;
  createdAt: string;
}

export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'EDR' | 'NDR' | 'MCP';
  status: 'active' | 'error' | 'disconnected';
  lastSync: string;
}