import { UnifiedEvent, EventSource, Severity } from '../types';

// Configuration for the proxy/backend URL
// In a real deployment, this points to your Node.js/Go backend which proxies requests to ExtraHop
const EXTRAHOP_BASE_URL = '/api/extrahop'; 

interface ExtraHopDetection {
  id: number;
  title: string;
  description: string;
  risk_score: number;
  start_time: number;
  mod_time: number;
  categories: string[];
  participants: Array<{
    role: string;
    object_value?: string; // IP address
    hostname?: string;
    object_type: string;
  }>;
  ticket_url?: string;
}

// Helper to map ExtraHop Risk Score (0-100) to Unified Severity
const mapRiskToSeverity = (score: number): Severity => {
  if (score >= 80) return Severity.CRITICAL;
  if (score >= 60) return Severity.HIGH;
  if (score >= 30) return Severity.MEDIUM;
  if (score >= 1) return Severity.LOW;
  return Severity.INFO;
};

// Helper to map ExtraHop Detection to UnifiedEvent
const normalizeDetection = (detection: ExtraHopDetection): UnifiedEvent => {
  // Attempt to identify source/dest based on roles
  const offender = detection.participants.find(p => p.role === 'offender' || p.role === 'client' || p.role === 'sender');
  const victim = detection.participants.find(p => p.role === 'victim' || p.role === 'server' || p.role === 'receiver');

  return {
    id: `extrahop-${detection.id}`,
    timestamp: new Date(detection.start_time).toISOString(),
    source: EventSource.NDR,
    vendor: 'ExtraHop Reveal(x)',
    eventType: detection.title,
    severity: mapRiskToSeverity(detection.risk_score),
    description: detection.description || 'No description provided',
    sourceIp: offender?.object_value || 'Unknown',
    destIp: victim?.object_value || undefined,
    processName: undefined, // Network detections usually don't have process names unless linked to EDA
    filePath: undefined,
    user: undefined, // Could extract from 'usernames' field if available in detailed view
    rawPayload: JSON.stringify(detection) // Store full object for debugging
  };
};

export const fetchExtraHopDetections = async (apiKey: string, timeRange: number = 3600000): Promise<UnifiedEvent[]> => {
  if (!apiKey) {
    console.warn("ExtraHop API Key missing. Returning empty set.");
    return [];
  }

  // Calculate time range (default last 1 hour)
  const until = new Date().getTime();
  const from = until - timeRange;

  const searchBody = {
    from: from,
    until: until,
    limit: 50,
    sort: [{ field: "risk_score", direction: "desc" }]
  };

  try {
    // Note: In a browser environment, this call will likely fail CORS unless 
    // configured via a proxy (defined in vite.config.js or similar)
    // or if the ExtraHop appliance allows CORS (uncommon).
    // The Backend Spec provided explains how to middleware this.
    const response = await fetch(`${EXTRAHOP_BASE_URL}/detections/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `ExtraHop apikey=${apiKey}`
      },
      body: JSON.stringify(searchBody)
    });

    if (!response.ok) {
        // Fallback for demo purposes if no backend connection
        console.error("ExtraHop API Error:", response.statusText);
        throw new Error("Failed to fetch detections");
    }

    const data: ExtraHopDetection[] = await response.json();
    return data.map(normalizeDetection);

  } catch (error) {
    console.error("Error fetching ExtraHop data:", error);
    return []; // Return empty on error to not break UI
  }
};

/**
 * Simulator function to mimic API response structure for development
 * without a live ExtraHop connection.
 */
export const simulateExtraHopData = (): UnifiedEvent[] => {
    const now = new Date().getTime();
    
    const mockRaw: ExtraHopDetection[] = [
        {
            id: 4001,
            title: "DCSync Attack Detected",
            description: "A device attempted to simulate a Domain Controller to synchronize credentials.",
            risk_score: 95,
            start_time: now - 1000 * 60 * 15,
            mod_time: now,
            categories: ["sec.exploitation"],
            participants: [
                { role: "offender", object_type: "device", object_value: "10.10.5.55", hostname: "attacker-vm" },
                { role: "victim", object_type: "device", object_value: "10.10.1.10", hostname: "prod-dc-01" }
            ]
        },
        {
            id: 4002,
            title: "External Remote Desktop Connection",
            description: "An external IP address initiated an RDP connection to an internal asset.",
            risk_score: 85,
            start_time: now - 1000 * 60 * 45,
            mod_time: now,
            categories: ["sec.access"],
            participants: [
                { role: "offender", object_type: "ipaddr", object_value: "198.51.100.23" },
                { role: "victim", object_type: "device", object_value: "10.10.20.5", hostname: "finance-server" }
            ]
        },
        {
            id: 4003,
            title: "Database Exfiltration via DNS Tunneling",
            description: "High volume of TXT records observed indicating potential tunneling.",
            risk_score: 70,
            start_time: now - 1000 * 60 * 120,
            mod_time: now,
            categories: ["sec.exfiltration"],
            participants: [
                { role: "offender", object_type: "device", object_value: "10.10.30.12", hostname: "dev-laptop" },
                { role: "victim", object_type: "device", object_value: "8.8.8.8" }
            ]
        }
    ];

    return mockRaw.map(normalizeDetection);
};