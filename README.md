# KubeIntel – Kubernetes Intelligent Resource & Network Management Platform

Web-based platform for managing and monitoring Kubernetes clusters, with health detection and an intelligent recommendation engine.

**Internship final product** – Assignments 1–10.

---

## Features

| Module | Description |
|--------|-------------|
| Dashboard | Cluster overview (nodes, namespaces, pods, status) |
| Nodes | Node status, roles, versions, IPs |
| Pods | Status, restarts, search & filter |
| Monitoring | CPU, memory, storage, network metrics |
| Deployments | Create, scale, restart, delete |
| Logs | Pod log viewer with search, copy, download |
| Events | Kubernetes events with search |
| Health | Health score, restarting pods, warnings |
| Recommendations | Overloaded CPU, memory pressure, unhealthy pods, underutilized nodes |
| Settings | API URL, refresh interval, theme |

---

## Tech Stack

- **Backend:** Go, Gin, Kubernetes client-go  
- **Frontend:** React.js, Vite, React Router  
- **Monitoring:** Metrics Server (Prometheus helpers optional)  
- **Packaging:** Docker, Kubernetes manifests  

---

## Quick Start

### Prerequisites

Go 1.21+, Node 18+, kubectl, Minikube/Kind, Metrics Server.

```bash
minikube start
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### Backend

```bash
cd backend
go mod tidy
go run ./cmd/server
# :8080
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

Full steps: **[docs/INSTALLATION.md](docs/INSTALLATION.md)**

---

## Documentation

| Document | Path |
|----------|------|
| Installation guide | [docs/INSTALLATION.md](docs/INSTALLATION.md) |
| User manual | [docs/USER_MANUAL.md](docs/USER_MANUAL.md) |
| System architecture | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| API documentation | [docs/API.md](docs/API.md) |
| Demo video guide | [docs/DEMO_VIDEO_GUIDE.md](docs/DEMO_VIDEO_GUIDE.md) |
| Assignment 9 notes | [docs/ASSIGNMENT_9_COMPLETE.md](docs/ASSIGNMENT_9_COMPLETE.md) |
| Kubernetes deploy | [kubernetes/README.md](kubernetes/README.md) |

---

## Project Structure

```
kubeintel/
├── backend/           # Go REST API
├── frontend/          # React dashboard
├── docs/              # Guides & API docs
├── kubernetes/       # Deploy manifests + RBAC
├── docker/            # docker-compose.yml
├── scripts/           # start-dev.sh, build-images.sh
└── README.md
```

---

## Docker

```bash
./scripts/build-images.sh
docker compose -f docker/docker-compose.yml up
```

- Frontend: http://localhost:3000  
- Backend: http://localhost:8080  

---

## Kubernetes

```bash
kubectl apply -f kubernetes/
```

See [kubernetes/README.md](kubernetes/README.md).

---

## API Overview

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard` | Overview |
| GET | `/api/nodes` | List nodes |
| GET | `/api/pods` | List pods |
| GET | `/api/deployments` | List deployments |
| POST | `/api/deployments` | Create |
| PUT | `/api/deployments/:name/scale` | Scale |
| POST | `/api/deployments/:name/restart` | Restart |
| DELETE | `/api/deployments/:name` | Delete |
| GET | `/api/logs` | Pod logs |
| GET | `/api/events` | Events |
| GET | `/api/health` | Health + warnings |
| GET | `/api/recommendations` | Recommendations |
| GET | `/api/monitoring/*` | Metrics |

Full reference: **[docs/API.md](docs/API.md)**

---

## Assignments Coverage

| # | Assignment | Status |
|---|------------|--------|
| 1 | Development Environment | Done |
| 2 | Kubernetes API Integration | Done |
| 3 | Dashboard Development | Done |
| 4 | Resource Monitoring | Done |
| 5 | Deployment Manager | Done |
| 6 | Logs and Events | Done |
| 7 | Health Monitoring | Done |
| 8 | Recommendation Engine | Done |
| 9 | Product Improvement | Done |
| 10 | Final Product | Done (record demo video separately) |

---

## Final Deliverables Checklist

- [x] Complete source code  
- [x] Git-ready repository structure  
- [x] Working Kubernetes dashboard  
- [x] Installation guide  
- [x] User manual  
- [x] System architecture document  
- [x] API documentation  
- [x] Docker image definitions  
- [x] Kubernetes deployment manifests  
- [ ] Recorded demonstration video *(record using docs/DEMO_VIDEO_GUIDE.md)*  

---

## License

Internship educational project.
