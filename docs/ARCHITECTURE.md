# System Architecture – KubeIntel

## 1. Overview

KubeIntel is a web-based platform that provides a centralized dashboard for monitoring and managing Kubernetes clusters, with an intelligent recommendation engine based on observed cluster state.

```
User → Web Dashboard (React) → Backend REST API (Go/Gin)
         → Kubernetes Client-Go → Kubernetes Cluster
              → Nodes / Pods / Deployments / Services / Events / Logs / Metrics
```

---

## 2. High-Level Components

| Component | Technology | Responsibility |
|-----------|------------|----------------|
| Frontend | React + Vite | UI, routing, charts, user actions |
| Backend API | Go + Gin | REST endpoints, business logic |
| K8s Client | client-go | Talk to Kubernetes API server |
| Metrics | Metrics Server / Prometheus helpers | CPU, memory, storage, network |
| Cluster | Minikube / Kind / any K8s | Workloads and infrastructure |

---

## 3. Backend Structure

```
backend/
├── cmd/server/main.go          # Entrypoint, CORS, route setup
├── routes/routes.go            # HTTP route registration
├── internal/
│   ├── api/                    # HTTP handlers (controllers)
│   │   ├── cluster.go
│   │   ├── dashboard.go
│   │   ├── nodes.go
│   │   ├── pods.go
│   │   ├── namespaces.go
│   │   ├── deployments.go
│   │   ├── monitoring.go
│   │   ├── logs.go
│   │   ├── events.go
│   │   ├── health.go
│   │   └── recommendations.go
│   ├── kubernetes/            # client-go wrapper
│   ├── monitoring/             # Metrics Server integration
│   ├── prometheus/             # Optional Prometheus queries
│   └── models/                 # Shared response models
└── Dockerfile
```

### Request flow

1. Browser calls `http://localhost:8080/api/...`
2. Gin router dispatches to the matching handler in `internal/api`
3. Handler uses the shared `kubernetes.Clientset` (or Metrics client)
4. Data is transformed into JSON and returned

### Authentication / access

- Development: uses local `~/.kube/config`
- In-cluster (future): can use ServiceAccount + RBAC (see `kubernetes/rbac.yaml`)

---

## 4. Frontend Structure

```
frontend/src/
├── App.jsx                 # Layout + routes
├── main.jsx                # React root + Router
├── components/
│   ├── Sidebar.jsx         # Navigation
│   ├── Navbar.jsx          # Cluster status bar
│   ├── Loading.jsx         # Shared spinner
│   ├── ErrorState.jsx      # Shared error + retry
│   ├── Toast.jsx           # Notifications
│   ├── DashboardCard.jsx
│   └── MetricCard.jsx
├── pages/
│   ├── Dashboard.jsx
│   ├── Nodes.jsx
│   ├── Pods.jsx
│   ├── DeploymentManager.jsx
│   ├── Monitoring.jsx
│   ├── Logs.jsx
│   ├── Events.jsx
│   ├── Recommendations.jsx
│   └── Settings.jsx
├── services/api.js         # Axios client for main APIs
├── services/monitoringService.js
└── api/logs.js, events.js  # Feature-specific clients
```

### Routing

| Path | Page |
|------|------|
| `/dashboard` | Cluster overview |
| `/nodes` | Node monitoring |
| `/pods` | Pod monitoring |
| `/deployments` | Deployment manager |
| `/monitoring` | Resource metrics |
| `/logs` | Pod logs |
| `/events` | Cluster events |
| `/health` | Health score + warnings |
| `/recommendations` | Recommendation engine |
| `/settings` | Preferences |

---

## 5. Recommendation Engine Logic

Inputs:

- Node conditions (Ready, MemoryPressure, DiskPressure, PIDPressure)
- Pod phase and container states (CrashLoopBackOff, OOMKilled, high restarts)
- Optional Metrics Server data (CPU millicores, memory MB)

Outputs:

- Severity: `critical` | `warning` | `info`
- Type: `cpu` | `memory` | `pod` | `node`
- Title, description, resource name, suggested action

Recommendations are ordered critical → warning → info.

---

## 6. Health Scoring

Base score: **100**

| Condition | Penalty |
|-----------|---------|
| Failed pod | −15 each |
| Pending pod | −5 each |
| Unhealthy node | −20 each |
| Pod with restarts | −2 each |

Score is clamped to ≥ 0. Warnings list is returned alongside the score.

---

## 7. Deployment Views

### Local development

```
Browser (5173) → Vite dev server → Backend (8080) → kube-apiserver
```

### Docker Compose

```
Browser → Frontend container (nginx:80)
        → Backend container (8080)
        → Host kubeconfig / API server
```

### Kubernetes

```
Browser → Frontend Service → Frontend Pod (nginx)
        → Backend Service  → Backend Pod (Go)
        → Kubernetes API (in-cluster config + RBAC)
```

---

## 8. Design Principles

- **Separation of concerns** – API handlers thin; K8s access isolated  
- **Read-mostly UI** – safe for operators; mutating actions limited to deployments  
- **Progressive enhancement** – core features work without Metrics Server; monitoring is richer with it  
- **Minimal config** – works with default kubeconfig out of the box  

---

## 9. Future Extensions

- In-cluster authentication and multi-cluster support  
- Prometheus as primary metrics source with historical graphs  
- Role-based UI (viewer vs operator)  
- WebSocket live log streaming  
