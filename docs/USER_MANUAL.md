# User Manual – KubeIntel

Guide for administrators using the Kubernetes Intelligent Resource & Network Management Platform.

---

## 1. Getting Started

1. Ensure backend and frontend are running (see [INSTALLATION.md](./INSTALLATION.md)).
2. Open **http://localhost:5173** in your browser.
3. You should see the **Dashboard** with cluster overview cards.
4. The top navbar shows **Cluster Connected** when the API can reach Kubernetes.

---

## 2. Navigation

The left sidebar is grouped into three sections:

| Section | Pages |
|---------|--------|
| **Overview** | Dashboard, Nodes, Pods |
| **Operations** | Deployments, Monitoring, Logs, Events |
| **Intelligence** | Health, Recommendations, Settings |

Click any item to open that module.

---

## 3. Module Guide

### 3.1 Dashboard

- **Total Nodes** – number of worker/control-plane nodes  
- **Namespaces** – count of namespaces  
- **Running / Failed Pods** – workload health at a glance  
- **Cluster Status** – Healthy / Unhealthy summary  

Auto-refreshes every 15 seconds. Use **Refresh** for an immediate update.

### 3.2 Nodes

Table of all cluster nodes:

- Name, Status (Ready / NotReady), Role, Kubernetes version  
- OS, architecture, internal IP, container runtime  

Use the search box to filter by name, status, or role.

### 3.3 Pods

Table of all pods across namespaces:

- Name, namespace, node, status, restart count, Pod IP, Host IP  

Filters:

- Text search (name / namespace / node)  
- Status dropdown (Running, Pending, Failed, Succeeded)  

### 3.4 Deployments

Manage application deployments:

| Action | How |
|--------|-----|
| **List** | View deployments in the default namespace |
| **Create** | Click Create → enter name, image, replicas, port |
| **Scale** | Enter new replica count when prompted |
| **Restart** | Triggers a rolling restart |
| **Delete** | Removes the deployment (confirm first) |

Success and error messages appear via notifications.

### 3.5 Monitoring

Resource utilization view:

- Node and pod CPU / memory metrics (requires Metrics Server)  
- Storage and network summary (when available)  

Data refreshes automatically every few seconds.

### 3.6 Logs

1. Select **Namespace**  
2. Select **Pod**  
3. Logs stream into the terminal-style viewer  
4. Use the search box to filter lines  
5. **Copy** or **Download** logs as needed  

### 3.7 Events

Kubernetes events table:

- Type (Normal / Warning), Reason, Object, Message, Time  

Search across reason, object, and message. Useful for debugging scheduling and image pull issues.

### 3.8 Health

- **Health Score** (0–100%) with Healthy / Degraded / Unhealthy label  
- Counts: nodes (healthy/unhealthy), pods (running/pending/failed/restarting)  
- **Warnings list** – failed pods, CrashLoopBackOff, memory pressure, etc.  

### 3.9 Recommendations

Intelligent operational advice:

| Type | Examples |
|------|----------|
| **Critical** | Failed pods, CrashLoopBackOff, OOMKilled, NotReady nodes |
| **Warning** | High CPU/memory, high restart count, disk/PID pressure |
| **Info** | Underutilized nodes (consolidation opportunity) |

Each card shows:

- Severity and type  
- Resource name (and namespace if applicable)  
- Suggested action  

Use filter chips: All / Critical / Warning / Info / CPU / Memory / Pod / Node.

### 3.10 Settings

- **Backend API URL** – default `http://localhost:8080`  
- **Refresh interval** – used as a preference (stored in browser)  
- **Theme** – Light / Dark preference  
- **About** – product version and stack  

Click **Save Settings** to store values in `localStorage`.

---

## 4. Typical Workflows

### Investigate a failing workload

1. Open **Health** → check warnings  
2. Open **Pods** → filter status = Failed  
3. Open **Logs** → select the pod and read logs  
4. Open **Events** → search by pod name  
5. Open **Recommendations** → follow suggested actions  

### Deploy a sample app

1. Open **Deployments** → Create  
2. Name: `nginx-demo`, Image: `nginx:1.25`, Replicas: `2`, Port: `80`  
3. Confirm it appears in the list and in **Pods**  

### Scale under load

1. Open **Monitoring** → identify high CPU/memory nodes  
2. Open **Recommendations** → check Overloaded CPU cards  
3. Open **Deployments** → Scale the relevant deployment  

---

## 5. Tips

- Keep Metrics Server installed for Monitoring and better recommendations.  
- Auto-refresh is enabled on most pages; still use **Refresh** after major changes.  
- Navbar **Disconnected** means the backend cannot reach the cluster API.  
- Empty Recommendations usually means the cluster is healthy.  

---

## 6. Support

For installation issues, see [INSTALLATION.md](./INSTALLATION.md).  
For API details, see [API.md](./API.md).  
For system design, see [ARCHITECTURE.md](./ARCHITECTURE.md).
