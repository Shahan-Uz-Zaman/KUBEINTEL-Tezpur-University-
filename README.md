# KubeIntel – Kubernetes Intelligent Resource & Network Management Platform

Web-based platform for **monitoring and managing Kubernetes clusters**, with health detection and an **intelligent recommendation engine**.

Built as a full internship product covering environment setup, Kubernetes API integration, dashboard UI, resource monitoring, deployment management, logs/events, health analysis, recommendations, UI polish, and final packaging.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Quick Start](#quick-start)
7. [Detailed Setup (New Device)](#detailed-setup-new-device)
8. [Configuration & Settings](#configuration--settings)
9. [API Overview](#api-overview)
10. [Docker](#docker)
11. [Kubernetes Deployment](#kubernetes-deployment)
12. [Documentation](#documentation)
13. [Assignments Coverage](#assignments-coverage)
14. [Demo Video](#demo-video)
15. [Troubleshooting](#troubleshooting)
16. [Final Deliverables](#final-deliverables)
17. [License](#license)

---

## Overview

**KubeIntel** provides a single web UI for Kubernetes administrators to:

- View cluster overview (nodes, namespaces, pods, status)
- Inspect nodes and pods with search and filters
- Monitor CPU, memory, storage, and network metrics
- Create, scale, restart, and delete deployments
- View pod logs and cluster events
- See a health score with warnings
- Get intelligent recommendations (CPU overload, memory pressure, unhealthy pods, underutilized nodes)
- Customize theme (light/dark), font size, API URL, and refresh interval

```
User → React Dashboard → Go REST API → Kubernetes Client-Go → Cluster
                              ↓
                    Metrics Server / Prometheus (optional)
```

---

## Features

| Module | Description |
|--------|-------------|
| **Dashboard** | Cluster overview cards: nodes, namespaces, running/failed pods, status |
| **Nodes** | Status, roles, version, OS, architecture, IPs; search |
| **Pods** | Status, restarts, namespace, node, IPs; search & status filter |
| **Monitoring** | CPU & memory (Metrics Server); storage & network (Prometheus optional) |
| **Deployments** | Create, list, scale, restart, delete |
| **Logs** | Pod log viewer with namespace/pod select, search, copy, download |
| **Events** | Kubernetes events with type, reason, object, message, time |
| **Health** | Health score (0–100%), node/pod counts, restarting pods, warnings list |
| **Recommendations** | Critical / Warning / Info advice for CPU, memory, pods, nodes |
| **Settings** | API URL, refresh interval, light/dark theme, font size (small/medium/large) |

### UI capabilities

- Light / Dark theme (live preview, saved in `localStorage`)
- Font size scaling across the app
- Responsive layout (desktop + mobile sidebar drawer)
- Shared loading spinner and error states with retry
- Auto-refresh on major pages using configurable interval

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Go 1.22+, Gin, Kubernetes client-go |
| Frontend | React 18, Vite, React Router, Axios, MUI, Bootstrap |
| Monitoring | Metrics Server (CPU/memory); Prometheus + node_exporter (network/storage, optional) |
| Cluster | Minikube, Kind, or any Kubernetes cluster |
| Packaging | Docker multi-stage builds, docker-compose, Kubernetes manifests + RBAC |

---

## Project Structure

```
kubeintel/
├── backend/
│   ├── cmd/server/              # Application entrypoint
│   ├── internal/
│   │   ├── api/                 # REST handlers (dashboard, nodes, pods, ...)
│   │   ├── kubernetes/          # client-go helpers
│   │   ├── monitoring/          # Metrics Server integration
│   │   └── prometheus/          # Optional Prometheus queries
│   ├── routes/                  # Route registration
│   ├── Dockerfile
│   ├── go.mod
│   └── go.sum
├── frontend/
│   ├── src/
│   │   ├── pages/               # Dashboard, Nodes, Pods, Monitoring, ...
│   │   ├── components/          # Sidebar, Navbar, Loading, Toast, ...
│   │   ├── services/            # API client, settings, monitoring
│   │   ├── api/                 # Logs & events helpers
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css            # Theme CSS variables
│   ├── nginx.conf
│   ├── Dockerfile
│   └── package.json
├── docs/
│   ├── INSTALLATION.md
│   ├── USER_MANUAL.md
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DEMO_VIDEO_GUIDE.md
│   └── ...
├── kubernetes/
│   ├── namespace.yaml
│   ├── rbac.yaml
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   └── README.md
├── docker/
│   └── docker-compose.yml
├── scripts/
│   ├── start-dev.sh
│   └── build-images.sh
└── README.md
```

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Go | 1.21+ | Backend API |
| Node.js | 18+ | Frontend |
| npm | 9+ | Frontend packages |
| Docker | 20+ | Containers (optional) |
| kubectl | 1.25+ | Cluster access |
| Minikube or Kind | Latest | Local Kubernetes |
| Git | 2.x | Source control |

Optional for network/storage metrics:

- Helm 3
- Prometheus (e.g. `kube-prometheus-stack`)

---

## Quick Start

### 1. Start cluster

```bash
minikube start --driver=docker
kubectl get nodes
```

### 2. Install Metrics Server (CPU / memory)

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Minikube: allow insecure kubelet TLS
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[
  {"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}
]'
```

### 3. Backend

```bash
cd backend
go mod tidy
go run ./cmd/server
# Listens on http://localhost:8080
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

### 5. Verify

```bash
curl http://localhost:8080/api/dashboard
curl http://localhost:8080/api/health
curl http://localhost:8080/api/recommendations
```

---

## Detailed Setup (New Device)

### Install tools (Ubuntu / Debian / WSL)

```bash
sudo apt update && sudo apt install -y git curl wget golang-go docker.io

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

sudo usermod -aG docker $USER
# Log out and back in
```

### Mac (Homebrew)

```bash
brew install go node docker kubectl minikube git
```

### Get source

```bash
git clone <your-repo-url> kubeintel
cd kubeintel
# or: unzip kubeintel_final.zip && cd kubeintel
```

### Run

```bash
minikube start --driver=docker
# Metrics Server commands from Quick Start above

cd backend && go mod tidy && go run ./cmd/server
# New terminal:
cd frontend && npm install && npm run dev
```

---

## Configuration & Settings

In the UI: **Settings** page

| Setting | Description | Default |
|---------|-------------|---------|
| Backend API URL | Base URL of Go API | `http://localhost:8080` |
| Refresh interval | Auto-refresh for polling pages (seconds) | `10` (range 5–120) |
| Theme | Light / Dark (live + persisted) | `light` |
| Font size | Small / Medium / Large | `medium` |

Stored in browser `localStorage` key: `kubeintel_settings`.

### Environment variables (backend)

| Variable | Description | Default |
|----------|-------------|---------|
| `PROMETHEUS_URL` | Prometheus base URL for network/storage | `http://localhost:9090` |
| `PORT` | HTTP listen port (if supported by binary) | `8080` |

Kubeconfig: uses `~/.kube/config` by default (or in-cluster config when deployed in Kubernetes).

---

## API Overview

**Base URL (dev):** `http://localhost:8080`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cluster` | Cluster summary & version |
| GET | `/api/dashboard` | Dashboard cards |
| GET | `/api/nodes` | List nodes |
| GET | `/api/pods` | List pods |
| GET | `/api/namespaces` | List namespaces |
| GET | `/api/deployments` | List deployments |
| POST | `/api/deployments` | Create deployment |
| PUT | `/api/deployments/:name/scale` | Scale replicas |
| POST | `/api/deployments/:name/restart` | Rolling restart |
| DELETE | `/api/deployments/:name` | Delete deployment |
| GET | `/api/logs?namespace=&pod=` | Pod logs |
| GET | `/api/events?namespace=` | Events |
| GET | `/api/health` | Health score + warnings |
| GET | `/health` | Same health handler |
| GET | `/api/recommendations` | Recommendation list |
| GET | `/api/monitoring/nodes` | Node metrics |
| GET | `/api/monitoring/pods` | Pod metrics |
| GET | `/api/monitoring/cluster` | Combined metrics |
| GET | `/api/monitoring/network` | Receive / transmit (Prometheus) |
| GET | `/api/monitoring/storage` | Storage (Prometheus) |

Full request/response shapes: **[docs/API.md](docs/API.md)**

### Example create deployment body

```json
{
  "namespace": "default",
  "name": "nginx-demo",
  "image": "nginx:1.25",
  "replicas": 2,
  "port": 80
}
```

---

## Docker

### Build images

```bash
./scripts/build-images.sh
# or manually:
docker build -t kubeintel-backend:latest ./backend
docker build -t kubeintel-frontend:latest ./frontend
```

### Docker Compose

```bash
docker compose -f docker/docker-compose.yml up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8080

Compose mounts host kubeconfig for local cluster access. Adjust paths on Windows if needed.

---

## Kubernetes Deployment

```bash
# Build images into Minikube Docker (optional)
eval $(minikube docker-env)
./scripts/build-images.sh

kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/rbac.yaml
kubectl apply -f kubernetes/backend-deployment.yaml
kubectl apply -f kubernetes/frontend-deployment.yaml

kubectl get all -n kubeintel
minikube service kubeintel-frontend -n kubeintel
# or:
kubectl port-forward -n kubeintel svc/kubeintel-frontend 8081:80
```

Details: **[kubernetes/README.md](kubernetes/README.md)**

---

## Documentation

| Document | Path |
|----------|------|
| Installation guide | [docs/INSTALLATION.md](docs/INSTALLATION.md) |
| User manual | [docs/USER_MANUAL.md](docs/USER_MANUAL.md) |
| System architecture | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| API reference | [docs/API.md](docs/API.md) |
| Demo video guide | [docs/DEMO_VIDEO_GUIDE.md](docs/DEMO_VIDEO_GUIDE.md) |
| Kubernetes deploy notes | [kubernetes/README.md](kubernetes/README.md) |

---

## Assignments Coverage

| # | Assignment | Status |
|---|------------|--------|
| 1 | Development Environment Setup | Done |
| 2 | Kubernetes API Integration | Done |
| 3 | Dashboard Development | Done |
| 4 | Resource Monitoring Module | Done |
| 5 | Deployment Manager | Done |
| 6 | Logs and Events Viewer | Done |
| 7 | Health Monitoring System | Done |
| 8 | Recommendation Engine | Done |
| 9 | Product Improvement (UI, nav, errors, settings) | Done |
| 10 | Final Product (docs, Docker, manifests) | Done |

---

## Demo Video

Record a 5–7 minute walkthrough:

1. Intro + Dashboard
2. Nodes & Pods
3. Create / scale deployment
4. Logs & Events
5. Health score & warnings
6. Recommendations
7. Settings (theme / font)
8. Closing

Guide: **[docs/DEMO_VIDEO_GUIDE.md](docs/DEMO_VIDEO_GUIDE.md)**

Optional test pod for warnings:

```bash
kubectl run bad --image=does-not-exist:latest --restart=Never
# After demo:
kubectl delete pod bad --ignore-not-found
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend cannot connect to cluster | Run `minikube start`; check `~/.kube/config`; `kubectl get nodes` |
| CPU/Memory empty on Monitoring | Install Metrics Server and apply Minikube TLS patch (see Quick Start) |
| Network Receive/Transmit always 0 | Expected without Prometheus; install `kube-prometheus-stack` and port-forward `:9090` |
| CORS / frontend cannot reach API | Backend must allow origin `http://localhost:5173`; confirm API on `:8080` |
| Frontend blank page | Check browser console; confirm `npm run dev` and backend are both running |
| Port already in use | Stop process on 8080/5173 or change ports |
| Docker permission denied | `sudo usermod -aG docker $USER` then re-login |
| Recommendations empty | Normal on a healthy cluster; create a failing pod to test |

### Useful debug commands

```bash
kubectl get nodes
kubectl get pods -A
kubectl top nodes
curl http://localhost:8080/api/health
curl http://localhost:8080/api/monitoring/network
curl http://localhost:9090/api/v1/query?query=up   # if using Prometheus
```

---

## Final Deliverables

- [x] Complete source code (Go + React)
- [x] Working Kubernetes dashboard
- [x] Installation guide
- [x] User manual
- [x] System architecture document
- [x] API documentation
- [x] Dockerfiles + docker-compose
- [x] Kubernetes manifests + RBAC
- [x] Settings: theme, font size, API URL, refresh
- [ ] Recorded demonstration video *(record separately)*
- [x] Git remote push *(your repository URL)*

---

## Scripts

```bash
# Start backend + frontend (dev)
./scripts/start-dev.sh

# Build Docker images
./scripts/build-images.sh
```

---

## License

Internship educational project.  
Not licensed for production use.

---

