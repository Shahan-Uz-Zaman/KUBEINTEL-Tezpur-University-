# API Documentation – KubeIntel

**Base URL (development):** `http://localhost:8080`

All JSON responses use `Content-Type: application/json`.

---

## Cluster & Inventory

### GET `/api/cluster`

Cluster summary and version.

**Response**

```json
{
  "clusterVersion": "v1.31.0",
  "platform": "linux/amd64",
  "nodes": 1,
  "namespaces": 5,
  "pods": 12,
  "runningPods": 10,
  "pendingPods": 1,
  "failedPods": 1
}
```

### GET `/api/dashboard`

Dashboard cards data.

**Response**

```json
{
  "clusterStatus": "Healthy",
  "nodeCount": 1,
  "namespaceCount": 5,
  "runningPods": 10,
  "failedPods": 0
}
```

### GET `/api/nodes`

**Response**

```json
{
  "count": 1,
  "nodes": [
    {
      "name": "minikube",
      "status": "Ready",
      "roles": "control-plane",
      "kubernetesVersion": "v1.31.0",
      "os": "linux",
      "architecture": "amd64",
      "containerRuntime": "docker://27.0.0",
      "internalIP": "192.168.49.2",
      "externalIP": "",
      "creationTime": "..."
    }
  ]
}
```

### GET `/api/pods`

**Response**

```json
{
  "count": 3,
  "pods": [
    {
      "name": "nginx-xxx",
      "namespace": "default",
      "node": "minikube",
      "status": "Running",
      "podIP": "10.244.0.5",
      "hostIP": "192.168.49.2",
      "restarts": 0,
      "creationTime": "..."
    }
  ]
}
```

### GET `/api/namespaces`

Lists namespaces (shape depends on handler; typically includes name list or objects).

---

## Monitoring

### GET `/api/monitoring/nodes`

Node metrics from Metrics Server.

### GET `/api/monitoring/pods`

Pod metrics from Metrics Server.

### GET `/api/monitoring/cluster`

Combined nodes + pods metrics.

### GET `/api/monitoring/network`

Network-related summary (Prometheus helper if configured).

### GET `/api/monitoring/storage`

Storage-related summary (Prometheus helper if configured).

---

## Deployments

### GET `/api/deployments?namespace=default`

List deployments.

### POST `/api/deployments`

Create deployment.

**Body**

```json
{
  "namespace": "default",
  "name": "nginx-demo",
  "image": "nginx:1.25",
  "replicas": 2,
  "port": 80
}
```

### DELETE `/api/deployments/:name`

Delete deployment (namespace default unless extended).

### PUT `/api/deployments/:name/scale`

**Body**

```json
{
  "namespace": "default",
  "replicas": 3
}
```

### POST `/api/deployments/:name/restart`

Trigger rolling restart.

---

## Logs & Events

### GET `/api/logs?namespace=default&pod=POD_NAME`

**Response**

```json
{
  "namespace": "default",
  "pod": "nginx-xxx",
  "logs": "..."
}
```

### GET `/api/events?namespace=default`

**Response**

```json
{
  "events": [
    {
      "type": "Normal",
      "reason": "Scheduled",
      "object": "pod/nginx-xxx",
      "namespace": "default",
      "message": "Successfully assigned...",
      "time": "2026-08-08T12:00:00Z"
    }
  ]
}
```

---

## Health & Recommendations

### GET `/api/health`

**Response**

```json
{
  "totalPods": 12,
  "runningPods": 10,
  "pendingPods": 1,
  "failedPods": 1,
  "restartingPods": 2,
  "totalNodes": 1,
  "healthyNodes": 1,
  "unhealthyNodes": 0,
  "healthScore": 85,
  "warningCount": 2,
  "warnings": [
    {
      "type": "pod",
      "severity": "critical",
      "resource": "bad",
      "namespace": "default",
      "message": "Pod is Failed"
    }
  ]
}
```

Also available as `GET /health` (same handler).

### GET `/api/recommendations`

**Response**

```json
{
  "count": 2,
  "critical": 1,
  "warning": 1,
  "info": 0,
  "recommendations": [
    {
      "id": "REC-1",
      "type": "pod",
      "severity": "critical",
      "title": "Unhealthy Pod: CrashLoopBackOff",
      "description": "Pod is stuck in CrashLoopBackOff state.",
      "resource": "my-app-xxx",
      "namespace": "default",
      "action": "Check pod logs and events. Fix image/config issues or resource limits."
    }
  ]
}
```

---

## Error Format

```json
{
  "error": "Human-readable message"
}
```

Common status codes: `400` validation, `500` server / Kubernetes errors.

---

## CORS

Development backend allows origin `http://localhost:5173` with methods GET, POST, PUT, DELETE, OPTIONS.
