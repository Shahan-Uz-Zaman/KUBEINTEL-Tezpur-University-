# Installation Guide – KubeIntel

This guide explains how to install and run the **Kubernetes Intelligent Resource & Network Management Platform**.

---

## 1. Prerequisites

| Tool | Minimum Version | Purpose |
|------|-----------------|---------|
| Go | 1.21+ | Backend API |
| Node.js | 18+ | Frontend |
| npm | 9+ | Frontend packages |
| Docker | 20+ | Container images (optional) |
| kubectl | 1.25+ | Cluster access |
| Minikube or Kind | Latest | Local Kubernetes cluster |
| Git | 2.x | Source control |

### Check installed tools

```bash
go version
node -v
npm -v
docker --version
kubectl version --client
minikube version   # or: kind version
```

---

## 2. Start a Kubernetes Cluster

### Option A – Minikube (recommended for development)

```bash
minikube start --driver=docker
kubectl get nodes
```

### Option B – Kind

```bash
kind create cluster --name kubeintel
kubectl cluster-info
```

### Install Metrics Server (required for resource monitoring)

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# For Minikube, patch metrics-server for insecure TLS (local only):
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[
  {"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}
]'

kubectl get apiservice v1beta1.metrics.k8s.io -o yaml | grep -i available
```

Ensure kubeconfig is available:

```bash
ls ~/.kube/config
kubectl get pods -A
```

---

## 3. Clone / Prepare Source

```bash
# If using Git
git clone <your-repo-url> kubeintel
cd kubeintel

# Or extract the project archive
unzip kubeintel_fixed_source.zip
cd kubeintel
```

---

## 4. Run Backend

```bash
cd backend
go mod tidy
go run ./cmd/server
```

Expected output:

```
Connected to Kubernetes: v1.xx.x
Server running on :8080
```

Verify:

```bash
curl http://localhost:8080/api/dashboard
curl http://localhost:8080/api/health
```

---

## 5. Run Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Open the browser:

```
http://localhost:5173
```

---

## 6. Production Build (optional)

### Frontend build

```bash
cd frontend
npm run build
# Output in frontend/dist/
```

### Backend binary

```bash
cd backend
go build -o server ./cmd/server
./server
```

---

## 7. Docker Installation (optional)

### Build images

```bash
# Backend
cd backend
docker build -t kubeintel-backend:latest .

# Frontend
cd ../frontend
docker build -t kubeintel-frontend:latest .
```

### Run with Docker Compose

From project root:

```bash
docker compose -f docker/docker-compose.yml up --build
```

- Backend: `http://localhost:8080`
- Frontend: `http://localhost:3000` (nginx)

> **Note:** Backend container needs access to the host kubeconfig or in-cluster service account. For local Minikube, mount `~/.kube/config` and ensure network reachability to the API server.

---

## 8. Deploy on Kubernetes

```bash
kubectl apply -f kubernetes/
kubectl get pods -n kubeintel
kubectl get svc -n kubeintel
```

See `docs/ARCHITECTURE.md` and `kubernetes/README.md` for details.

---

## 9. Troubleshooting

| Problem | Solution |
|---------|----------|
| `Kubernetes client not initialized` | Ensure `~/.kube/config` exists and cluster is running |
| Metrics endpoints return 500 | Install and patch metrics-server (see section 2) |
| CORS errors in browser | Backend allows `http://localhost:5173` – match Vite port |
| Frontend cannot reach API | Confirm backend is on `:8080` and no firewall block |
| Empty recommendations | Normal on healthy cluster; create a failing pod to test |
| Port already in use | Change port or stop the process using 8080 / 5173 |

### Test failing pod (for Health / Recommendations)

```bash
kubectl run bad --image=does-not-exist:latest --restart=Never
# Wait 10–20 seconds, then refresh Health and Recommendations pages
kubectl delete pod bad
```

---

## 10. Uninstall

```bash
# Stop local servers (Ctrl+C)

# Delete Kind cluster
kind delete cluster --name kubeintel

# Or stop Minikube
minikube stop

# Remove K8s manifests
kubectl delete -f kubernetes/ --ignore-not-found
```

---

**Next:** See [USER_MANUAL.md](./USER_MANUAL.md) for how to use the platform.
