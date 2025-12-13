# NexusDefend XDR Backend Specification

## 1. Executive Summary
This document outlines the technical specifications for the backend services required to support the NexusDefend XDR Platform. The backend acts as a central aggregator (BFF - Backend for Frontend) that connects the React frontend to various security tools (ExtraHop NDR, CrowdStrike EDR, Postgres, Redis, and Google Gemini).

## 2. Architecture Overview

### 2.1 Technology Stack
*   **Runtime**: Node.js (v20+ LTS) or Go (1.21+) for high concurrency.
*   **Framework**: Express.js or Fastify (if Node), Gin (if Go).
*   **Database (Primary)**: PostgreSQL 15+ (for incidents, user data, configurations).
*   **Cache/Queue**: Redis 7+ (for high-velocity event buffering and API response caching).
*   **Identity**: SAML 2.0 / OIDC provider integration (e.g., Okta, Auth0).
*   **AI Integration**: Google GenAI SDK (Vertex AI or Gemini API).

### 2.2 System Diagram
```mermaid
graph TD
    Client[React Frontend] <--> |HTTPS/REST + WS| BFF[XDR Backend API]
    BFF <--> |SAML| IdP[Identity Provider]
    BFF <--> |SQL| DB[(PostgreSQL)]
    BFF <--> |Cache| Redis[(Redis)]
    BFF <--> |REST API| ExtraHop[ExtraHop Reveal(x)]
    BFF <--> |REST API| EDR[CrowdStrike/SentinelOne]
    BFF <--> |RPC/REST| GenAI[Google Gemini]
```

## 3. Data Ingestion Strategy

### 3.1 Polling vs. Webhooks
*   **ExtraHop (NDR)**: Primarily **Polling**.
    *   Endpoint: `/api/v1/detections/search`
    *   Frequency: Every 60 seconds.
    *   State Tracking: Store `update_time` of the last fetched detection in Redis to query only new deltas (`from` parameter).
*   **EDR (CrowdStrike)**: **Streaming/Webhook** preferred.
    *   Use CrowdStrike Streaming API (Falcon Data Replicator) or Webhooks for near real-time alerts.
    *   Fallback: Polling `/alerts/queries/alerts/v1` every 60 seconds.

### 3.2 Event Normalization Pipeline
1.  **Ingest**: Raw JSON received from vendor.
2.  **Normalize**: Map vendor-specific fields to `UnifiedEvent` schema (see `types.ts`).
3.  **Enrich**:
    *   Resolve IP to Hostname (via internal Asset DB or DNS).
    *   Add GeoIP data.
4.  **Deduplicate**: Check Redis for recent identical `source_id` within 5 minutes.
5.  **Persist**: Save to Postgres `events` table.
6.  **Broadcast**: Push to frontend via WebSocket (Socket.io) for "Live View".

## 4. API Specification (Internal BFF)

### 4.1 Authentication & Authorization
*   **Middleware**: Validates JWT token from SAML login.
*   **RBAC**: Checks user roles (`ADMIN`, `ANALYST`) against route permissions.

### 4.2 Endpoints

#### `GET /api/v1/incidents`
*   **Description**: List incidents with pagination and filtering.
*   **Parameters**: `page`, `limit`, `severity`, `source` (EDR/NDR).
*   **Implementation**: Query Postgres `incidents` table.

#### `GET /api/v1/incidents/:id/events`
*   **Description**: Get all normalized events for a specific incident.
*   **Implementation**: Join `incidents` and `events` tables.

#### `POST /api/extrahop/detections/search` (Proxy)
*   **Description**: Securely proxy requests to ExtraHop to avoid exposing API keys to the client.
*   **Header**: `X-Nexus-Auth` (Internal JWT).
*   **Backend Logic**:
    1.  Validate User.
    2.  Retrieve ExtraHop API Key from Vault/Env (NOT database).
    3.  Forward request to `https://{extrahop_appliance}/api/v1/detections/search`.
    4.  Cache response in Redis for 30 seconds to prevent rate limit abuse.

#### `POST /api/ai/analyze`
*   **Description**: Send aggregated event context to Gemini.
*   **Body**: `{ eventIds: string[] }`
*   **Backend Logic**:
    1.  Fetch full event payloads from DB.
    2.  Sanitize PII (optional).
    3.  Construct Prompt.
    4.  Call Google GenAI API.
    5.  Return Markdown response.

## 5. Database Schema (PostgreSQL)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    role VARCHAR(50),
    timezone VARCHAR(50) DEFAULT 'UTC',
    last_login TIMESTAMP
);

CREATE TABLE incidents (
    id UUID PRIMARY KEY,
    title VARCHAR(255),
    status VARCHAR(50),
    severity VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE events (
    id VARCHAR(255) PRIMARY KEY, -- "extrahop-123"
    incident_id UUID REFERENCES incidents(id),
    source VARCHAR(10), -- EDR/NDR
    vendor VARCHAR(50),
    event_type VARCHAR(100),
    severity VARCHAR(20),
    timestamp TIMESTAMP,
    raw_payload JSONB, -- Store original vendor JSON
    normalized_fields JSONB -- Indexed fields (ip, user, host)
);

CREATE INDEX idx_events_timestamp ON events(timestamp);
CREATE INDEX idx_events_incident ON events(incident_id);
```

## 6. Redis Usage
*   **Session Store**: Manage user sessions (TTL: 24h).
*   **API Caching**: Cache expensive queries (e.g., Topology Graph data) for 5-10 minutes.
*   **Deduplication**: Key `dedup:{event_id}`, TTL 10 mins.

## 7. Security Requirements
1.  **Secrets Management**: API Keys (ExtraHop, CrowdStrike, Gemini) must be stored in HashiCorp Vault or AWS Secrets Manager, injected as Environment Variables at runtime.
2.  **Audit Logging**: All actions (View Incident, Run AI Analysis) must be logged to an immutable audit log.
3.  **Rate Limiting**: Implement strict rate limits per user IP to prevent DDoS.

## 8. Development Steps (Immediate)
1.  Set up Node.js/Express scaffold.
2.  Configure `dotenv` for `EXTRAHOP_API_KEY`, `EXTRAHOP_HOST`.
3.  Implement the `/api/extrahop/detections/search` proxy endpoint.
4.  Configure `cors` to allow requests from the React frontend.
5.  Dockerize the backend.
