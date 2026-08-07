# KubeIntel – Kubernetes Intelligent Resource & Network Management Platform

Web-based platform for managing and monitoring Kubernetes clusters with an intelligent recommendation engine.

## Features

- **Dashboard** – Cluster overview (nodes, namespaces, pods, status)
- **Node Monitoring** – Node status, roles, versions, IPs
- **Pod Monitoring** – Pod status, restarts, IPs with search & filter
- **Resource Monitoring** – CPU, memory, storage, network metrics
- **Deployment Manager** – Create, scale, restart, delete deployments
- **Logs & Events** – Pod logs and Kubernetes events viewer
- **Health Monitoring** – Health score, failed/restarting pods, warnings
- **Recommendation Engine** – Actionable advice for overloaded CPU, memory pressure, unhealthy pods, underutilized nodes
- **Settings** – API URL, refresh interval, theme preferences

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Go, Gin, Kubernetes Client-Go |
| Frontend | React.js, Vite, React Router |
| Monitoring | Metrics Server, Prometheus (optional) |
| Orchestration | Kubernetes (Minikube / Kind) |

## Project Structure

```
kubeintel/
├── backend/
│   ├── cmd/server/          # Main entrypoint
│   ├── internal/
│   │   ├── api/             # REST handlers
│   │   ├── kubernetes/     # K8s client helpers
│   │   ├── monitoring/      # Metrics integration
│   │   └── prometheus/      # Prometheus helpers
│   ├── routes/              # Route registration
│   └── Dockerfile
├── frontend/
│   └── src/
│       ├── pages/           # Dashboard, Nodes, Pods, etc.
│       ├── components/      # Sidebar, Navbar, Cards
│       ├── services/        # API clients
│       └── api/
├── docs/
├── scripts/
├── docker/
├── kubernetes/
└── README.md
```

## Prerequisites

- Go 1.21+
- Node.js 18+
- Docker
- kubectl
- A running Kubernetes cluster (Minikube or Kind recommended)
- Metrics Server installed (for resource metrics)

## Quick Start

### 1. Start Kubernetes (example with Minikube)

```bash
minikube start
kubectl get nodes
```

### 2. Backend

```bash
cd backend
go mod tidy
go run ./cmd/server
# Server listens on :8080
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# App at http://localhost:5173
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cluster` | Cluster info |
| GET | `/api/nodes` | List nodes |
| GET | `/api/pods` | List pods |
| GET | `/api/namespaces` | List namespaces |
| GET | `/api/dashboard` | Dashboard summary |
| GET | `/api/monitoring/nodes` | Node metrics |
| GET | `/api/monitoring/pods` | Pod metrics |
| GET | `/api/monitoring/cluster` | Combined metrics |
| GET | `/api/deployments` | List deployments |
| POST | `/api/deployments` | Create deployment |
| DELETE | `/api/deployments/:name` | Delete deployment |
| PUT | `/api/deployments/:name/scale` | Scale deployment |
| POST | `/api/deployments/:name/restart` | Restart deployment |
| GET | `/api/logs` | Pod logs |
| GET | `/api/events` | Cluster events |
| GET | `/api/health` | Health score + warnings |
| GET | `/api/recommendations` | Intelligent recommendations |

## Development Assignments Covered

1. Development Environment
2. Kubernetes API Integration
3. Dashboard Development
4. Resource Monitoring
5. Deployment Manager
6. Logs and Events
7. Health Monitoring
8. Recommendation Engine
9. Product Improvement (UI, Settings, loading states)
10. Final Product packaging (in progress)

## License

Internship project – for educational use.
