# Kubernetes Deployment

## Build images (local / Minikube)

```bash
# Point Docker to Minikube's daemon (optional but convenient)
eval $(minikube docker-env)

cd backend && docker build -t kubeintel-backend:latest .
cd ../frontend && docker build -t kubeintel-frontend:latest .
```

## Apply manifests

```bash
kubectl apply -f namespace.yaml
kubectl apply -f rbac.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml

kubectl get all -n kubeintel
```

## Access UI

```bash
# NodePort
minikube service kubeintel-frontend -n kubeintel

# Or port-forward
kubectl port-forward -n kubeintel svc/kubeintel-frontend 8081:80
# Open http://localhost:8081
```

## Notes

- Backend uses in-cluster ServiceAccount (`kubeintel`) with ClusterRole permissions.
- For production, push images to a registry and set `imagePullPolicy: Always` with full image names.
- Frontend nginx should proxy `/api` to the backend service, or the UI must be configured with the backend Service URL.
