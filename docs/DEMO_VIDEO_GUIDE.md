# Demonstration Video Guide

Record a **3–6 minute** walkthrough of KubeIntel for final submission.

## Suggested outline (timestamp guide)

| Time | Section | What to show |
|------|---------|--------------|
| 0:00–0:30 | Intro | Project name, your name, one-line objective |
| 0:30–1:00 | Architecture | Briefly show architecture diagram or folder structure |
| 1:00–1:40 | Dashboard | Cluster overview cards, navbar Connected status |
| 1:40–2:10 | Nodes & Pods | Tables, search/filter |
| 2:10–3:00 | Deployments | Create a deployment (e.g. nginx), scale, restart |
| 3:00–3:40 | Logs & Events | Open logs for the new pod; show events |
| 3:40–4:20 | Health | Score, warnings; optionally show a failing pod |
| 4:20–5:10 | Recommendations | Filter by severity; explain one recommendation |
| 5:10–5:40 | Settings / wrap-up | Settings page; thank you + tech stack |

## Before recording

```bash
# Cluster up
minikube start
# Backend + frontend running
# Optional: clean state
kubectl delete pod bad --ignore-not-found
```

## Optional demo script (create failure)

```bash
kubectl run bad --image=does-not-exist:latest --restart=Never
# Show Health + Recommendations reacting
kubectl delete pod bad
```

## Recording tips

- 1080p screen capture  
- Speak clearly; avoid long silent pauses  
- Zoom browser to 110–125% if text is small  
- Export as MP4  

## Deliverable name suggestion

`KubeIntel_Internship_Demo.mp4`
