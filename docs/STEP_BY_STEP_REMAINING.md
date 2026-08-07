# KubeIntel – Step-by-Step Guide for Remaining Work

## What Was Fixed / Added (this session)

### Backend
1. **Recommendation Engine** – `backend/internal/api/recommendations.go`
   - Endpoint: `GET /api/recommendations`
   - Detects: overloaded CPU, memory pressure, disk/PID pressure, failed/restarting pods, CrashLoopBackOff, OOMKilled, underutilized nodes
2. **Health API improved** – `backend/internal/api/health.go`
   - Added: `restartingPods`, `warnings[]`, `warningCount`
3. **Routes updated** – `backend/routes/routes.go`
   - Registered `/api/recommendations`

### Frontend
4. **Nodes page** – `frontend/src/pages/Nodes.jsx` (+ TablePages.css)
5. **Pods page** – `frontend/src/pages/Pods.jsx`
6. **Recommendations page** – `frontend/src/pages/Recommendations.jsx`
7. **Settings page** – `frontend/src/pages/Settings.jsx`
8. **Health page improved** – warnings list + restarting pods
9. **App routes fixed** – all sidebar links now work
10. **API service** – added getNodes, getPods, getRecommendations, getHealth
11. **README.md** – filled with setup and API docs

---

## How to Apply These Changes to Your Local Project

### Option A – Copy fixed files into your repo

```bash
# From your kubeintel root
cp path/to/fixed/backend/internal/api/recommendations.go backend/internal/api/
cp path/to/fixed/backend/internal/api/health.go           backend/internal/api/
cp path/to/fixed/backend/routes/routes.go                 backend/routes/
cp path/to/fixed/frontend/src/App.jsx                     frontend/src/
cp path/to/fixed/frontend/src/Health.jsx                  frontend/src/
cp path/to/fixed/frontend/src/Health.css                  frontend/src/
cp path/to/fixed/frontend/src/services/api.js             frontend/src/services/
cp path/to/fixed/frontend/src/pages/Nodes.jsx             frontend/src/pages/
cp path/to/fixed/frontend/src/pages/Pods.jsx              frontend/src/pages/
cp path/to/fixed/frontend/src/pages/Recommendations.jsx   frontend/src/pages/
cp path/to/fixed/frontend/src/pages/Recommendations.css   frontend/src/pages/
cp path/to/fixed/frontend/src/pages/Settings.jsx          frontend/src/pages/
cp path/to/fixed/frontend/src/pages/Settings.css          frontend/src/pages/
cp path/to/fixed/frontend/src/pages/TablePages.css        frontend/src/pages/
cp path/to/fixed/README.md                                .
```

### Option B – Manually recreate (if you prefer understanding each step)

Follow the numbered steps below.

---

## Step-by-Step Remaining Progress

### STEP 1 – Run Recommendation Engine (verify)

```bash
# Terminal 1 – Backend
cd backend
go run ./cmd/server

# Terminal 2 – Test
curl http://localhost:8080/api/recommendations | jq

# Terminal 3 – Frontend
cd frontend
npm run dev
# Open http://localhost:5173/recommendations
```

Expected: JSON with `count`, `critical`, `warning`, `info`, and `recommendations[]`.

---

### STEP 2 – Verify new pages in UI

Open the sidebar and click each:

| Menu item        | Should show                          |
|------------------|--------------------------------------|
| Dashboard        | Cluster overview cards               |
| Nodes            | Table of nodes with status           |
| Pods             | Table of pods + search/filter        |
| Deployments      | Deploy/scale/restart UI              |
| Monitoring       | CPU/memory/storage metrics           |
| Logs             | Pod log viewer                       |
| Events           | Cluster events                       |
| Health           | Score + warnings list                |
| Recommendations  | Intelligent recommendations          |
| Settings         | API URL / refresh / theme form       |

---

### STEP 3 – Improve Health further (optional polish)

If you want more detail:

1. In Health page, add a table of failed pods with links to Logs.
2. Color-code health score ring (you already have color by score).
3. Auto-refresh every 10s (already added).

---

### STEP 4 – Product Improvement (Assignment 9)

Checklist:

- [x] Navigation (all routes wired)
- [x] Loading indicators (on new pages)
- [x] Error handling (error states on new pages)
- [x] Settings page
- [ ] Consistent loading spinner component (optional – extract shared Spinner)
- [ ] Global toast for deployment success/failure
- [ ] Better empty states on Logs/Events if needed

Suggested small improvements:

1. Create `frontend/src/components/Loading.jsx` and reuse.
2. Add a success toast in DeploymentManager after create/scale/delete.
3. Make Navbar show current cluster name from `/api/cluster`.

---

### STEP 5 – Final Product Packaging (Assignment 10)

#### 5.1 README
Already written. Keep it updated.

#### 5.2 Installation Guide (`docs/INSTALLATION.md`)

```markdown
# Installation

1. Prerequisites: Go, Node, Docker, kubectl, Minikube/Kind
2. Start cluster: `minikube start`
3. Install metrics-server (for monitoring)
4. Run backend: `cd backend && go run ./cmd/server`
5. Run frontend: `cd frontend && npm install && npm run dev`
```

#### 5.3 Kubernetes manifests (`kubernetes/`)

Create:

- `backend-deployment.yaml` – Deployment + Service for Go API
- `frontend-deployment.yaml` – Deployment + Service for React (or nginx serving build)
- `configmap.yaml` – API URL config
- `rbac.yaml` – ServiceAccount + ClusterRole for reading pods/nodes/metrics

#### 5.4 Docker

```dockerfile
# backend/Dockerfile already exists – verify it builds:
cd backend
docker build -t kubeintel-backend:latest .
```

Add frontend Dockerfile:

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

#### 5.5 Documentation set

| Document | Path |
|----------|------|
| Installation guide | `docs/INSTALLATION.md` |
| User manual | `docs/USER_MANUAL.md` |
| Architecture | `docs/ARCHITECTURE.md` |
| API docs | `docs/API.md` (or Swagger later) |

#### 5.6 Demo video

Record 3–5 minutes:

1. Dashboard overview
2. Nodes & Pods
3. Deploy an app and scale it
4. View logs/events
5. Health + Recommendations

---

## Suggested Daily Order

| Day | Focus |
|-----|--------|
| Day 1 | Apply fixed files, run, verify all pages |
| Day 2 | Polish UI (loading, toasts, empty states) |
| Day 3 | Write INSTALLATION + USER_MANUAL |
| Day 4 | Docker images + K8s manifests |
| Day 5 | Architecture + API docs + demo video |
| Day 6 | Final testing + Git cleanup + submission |

---

## Quick Test Commands

```bash
# Backend health
curl http://localhost:8080/api/health

# Recommendations
curl http://localhost:8080/api/recommendations

# Nodes / Pods
curl http://localhost:8080/api/nodes
curl http://localhost:8080/api/pods

# Dashboard
curl http://localhost:8080/api/dashboard
```

---

## Common Issues

| Problem | Fix |
|---------|-----|
| `Kubernetes client not initialized` | Ensure `~/.kube/config` exists and cluster is running |
| Metrics endpoints 500 | Install metrics-server: `kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml` |
| CORS errors | Backend allows `http://localhost:5173` – match your Vite port |
| Empty recommendations | Normal on a healthy small cluster; create a failing pod to test |

Create a test failing pod:

```bash
kubectl run bad --image=does-not-exist:latest --restart=Never
# Wait a few seconds, then refresh Recommendations / Health
```

