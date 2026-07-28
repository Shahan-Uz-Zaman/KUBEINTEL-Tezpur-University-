# KubeIntel – Kubernetes Intelligent Resource & Network Management Platform

## Overview

KubeIntel is a web-based Kubernetes management and monitoring platform developed using **Go**, **React**, and **Kubernetes Client-Go**. The platform provides administrators with a centralized dashboard for monitoring Kubernetes clusters, managing workloads, viewing logs and events, monitoring resource utilization, and analyzing cluster health.

---

# Features

* Kubernetes Cluster Overview
* Dashboard with Cluster Statistics
* Namespace Monitoring
* Node Monitoring
* Pod Monitoring
* Deployment Management
* CPU & Memory Monitoring
* Storage Monitoring
* Network Monitoring
* Kubernetes Events Viewer
* Pod Log Viewer
* Health Monitoring
* REST API Backend
* Responsive React Frontend

---

# Technology Stack

## Backend

* Go
* Gin Framework
* Kubernetes Client-Go
* Metrics Server
* Prometheus (Optional)

## Frontend

* React.js
* Vite
* Axios
* CSS

## Container Platform

* Docker
* Kubernetes
* Minikube

---

# System Requirements

## Operating System

* Ubuntu 22.04/24.04 LTS

## Software

* Go 1.25+
* Node.js 20+
* npm
* Docker
* Kubernetes
* kubectl
* Minikube
* Helm
* Git

---

# Installation Guide

## Step 1: Install Docker

```bash
sudo apt update
sudo apt install docker.io -y

sudo systemctl enable docker
sudo systemctl start docker

sudo usermod -aG docker $USER
newgrp docker
```

Verify

```bash
docker version
```

---

## Step 2: Install Minikube

```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64

sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

Verify

```bash
minikube version
```

---

## Step 3: Install kubectl

```bash
sudo snap install kubectl --classic
```

Verify

```bash
kubectl version --client
```

---

## Step 4: Install Helm

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

Verify

```bash
helm version
```

---

## Step 5: Start Kubernetes Cluster

```bash
minikube start
```

Verify

```bash
kubectl get nodes
```

Expected Output

```text
NAME        STATUS   ROLES
minikube    Ready    control-plane
```

---

# Clone Project

```bash
git clone https://github.com/USERNAME/kubeintel.git

cd kubeintel
```

---

# Backend Setup

Move into backend directory

```bash
cd backend
```

Download dependencies

```bash
go mod tidy
```

Run backend

```bash
go run cmd/server/main.go
```

Expected Output

```
Server running on :8080
```

---

# Verify Backend

Health Check

```bash
curl http://localhost:8080/health
```

Dashboard

```bash
curl http://localhost:8080/api/dashboard
```

Nodes

```bash
curl http://localhost:8080/api/nodes
```

Pods

```bash
curl http://localhost:8080/api/pods
```

Namespaces

```bash
curl http://localhost:8080/api/namespaces
```

Deployments

```bash
curl http://localhost:8080/api/deployments
```

---

# Frontend Setup

Open another terminal

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Start frontend

```bash
npm run dev
```

Expected Output

```
VITE

Local:
http://localhost:5173
```

Open browser

```
http://localhost:5173
```

---

# Install Metrics Server

Enable Metrics Server

```bash
minikube addons enable metrics-server
```

Verify

```bash
kubectl get pods -n kube-system | grep metrics
```

Wait until

```
Running
```

Check metrics

```bash
kubectl top nodes

kubectl top pods -A
```

---

# Install Prometheus

Add Helm Repository

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

helm repo update
```

Create Namespace

```bash
kubectl create namespace monitoring
```

Install

```bash
helm install prometheus prometheus-community/prometheus -n monitoring
```

Verify

```bash
kubectl get pods -n monitoring
```

Wait until all pods are Running.

Access Prometheus

```bash
kubectl port-forward -n monitoring svc/prometheus-server 9090:80
```

Browser

```
http://localhost:9090
```

---

# Useful Kubernetes Commands

Cluster

```bash
kubectl cluster-info

kubectl get nodes

kubectl get namespaces
```

Pods

```bash
kubectl get pods -A

kubectl describe pod POD_NAME

kubectl logs POD_NAME
```

Deployments

```bash
kubectl get deployments -A

kubectl create deployment nginx --image=nginx

kubectl scale deployment nginx --replicas=3

kubectl delete deployment nginx
```

Services

```bash
kubectl get svc -A
```

Events

```bash
kubectl get events -A
```

Metrics

```bash
kubectl top nodes

kubectl top pods -A
```

---

# API Endpoints

| Endpoint                | Description         |
| ----------------------- | ------------------- |
| /health                 | Health Check        |
| /api/dashboard          | Dashboard Summary   |
| /api/cluster            | Cluster Information |
| /api/nodes              | List Nodes          |
| /api/pods               | List Pods           |
| /api/namespaces         | List Namespaces     |
| /api/deployments        | List Deployments    |
| /api/monitoring/cluster | Cluster Monitoring  |
| /api/monitoring/nodes   | Node Monitoring     |
| /api/monitoring/pods    | Pod Monitoring      |
| /api/monitoring/network | Network Monitoring  |
| /api/monitoring/storage | Storage Monitoring  |
| /api/events             | Kubernetes Events   |
| /api/logs               | Pod Logs            |
| /api/health             | Health Status       |

---

# Project Structure

```
kubeintel/
│
├── backend/
│   ├── cmd/
│   ├── internal/
│   ├── routes/
│   ├── configs/
│   ├── go.mod
│   └── main.go
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── docs/
├── scripts/
├── docker/
├── kubernetes/
└── README.md
```

---

# Troubleshooting

## Backend returns null

Check deployments

```bash
kubectl get deployments -A
```

Create test deployment

```bash
kubectl create deployment nginx --image=nginx
```

---

## Metrics API not available

Enable Metrics Server

```bash
minikube addons enable metrics-server
```

Verify

```bash
kubectl top nodes
```

---

## Prometheus namespace not found

Create namespace

```bash
kubectl create namespace monitoring
```

Install Prometheus

```bash
helm install prometheus prometheus-community/prometheus -n monitoring
```

---

## Frontend Blank Page

Check backend is running

```bash
curl http://localhost:8080/health
```

Open browser Developer Tools (F12) and inspect Console and Network tabs for API or JavaScript errors.

---

# Future Enhancements

* Authentication & Role-Based Access Control (RBAC)
* Real-time monitoring with WebSockets
* Alerting using Prometheus Alertmanager
* Grafana Dashboard Integration
* Multi-cluster Support
* AI-based Recommendation Engine
* Notification System
* PDF/CSV Report Export
* Dark Mode
* Audit Logs

---

# License

This project is intended for educational and internship purposes.

---

# Author

**KubeIntel – Kubernetes Intelligent Resource & Network Management Platform**

Developed using Go, React, Kubernetes, Docker, Prometheus, and Minikube.
