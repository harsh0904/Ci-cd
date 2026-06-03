# Real-World DevOps CI/CD Project 🚀

This is a complete, production-ready DevOps infrastructure project. It includes a microservice Node.js API with MongoDB, automated CI/CD pipelines, containerization, Kubernetes orchestration, and a complete Prometheus & Grafana monitoring stack.

## 🌐 Live Environments

The entire infrastructure is deployed and running live on a dedicated VPS server:

| Service | Live URL | Details |
|---------|----------|---------|
| **Task Manager API** | [https://cicd.snenmh.xyz](https://cicd.snenmh.xyz) | Node.js API running in Kubernetes |
| **API Health Check** | [https://cicd.snenmh.xyz/health](https://cicd.snenmh.xyz/health) | Endpoint returning API version and uptime |
| **Prometheus Metrics**| [https://cicd.snenmh.xyz/metrics](https://cicd.snenmh.xyz/metrics) | Scraped by Prometheus every 15s |
| **Grafana Dashboard**| [https://grafana.snenmh.xyz](https://grafana.snenmh.xyz) | Full monitoring UI |
| **Jenkins Pipeline** | [https://jenkins.snenmh.xyz](https://jenkins.snenmh.xyz) | CI/CD Server |

## 🏗️ Architecture & Technologies Used

- **Application:** Node.js (Express) REST API + Jest for testing.
- **Database:** MongoDB (Running as a Headless Service inside Kubernetes).
- **Containerization:** Docker & DockerHub (`harsh091004/cicd-project`).
- **Orchestration:** Kubernetes (Minikube on VPS) with Deployments, Services, ConfigMaps, and HPA (Horizontal Pod Autoscaler).
- **Monitoring:** Prometheus & Grafana (deployed via `kube-prometheus-stack` Helm chart).
- **CI/CD:** Dual pipelines configured for both **GitHub Actions** and **Jenkins**.
- **Web Server / Proxy:** Nginx with Let's Encrypt SSL Certificates.

## 🚀 How it Works

1. **Continuous Integration (CI):** When code is pushed to the `main` branch, GitHub Actions and Jenkins trigger automatically. They run the Jest test suite to ensure code health.
2. **Continuous Delivery (CD):** Once tests pass, the Docker image is built and pushed to DockerHub with the `latest` tag.
3. **Continuous Deployment (CD):** The pipeline securely connects to the VPS, applies the new Kubernetes manifests (`k8s/api.yaml`, `k8s/mongodb.yaml`), and triggers a rolling restart of the application pods.
4. **Monitoring:** Prometheus automatically discovers the new pods via annotations and scrapes `/metrics`. Grafana visualizes this data.

## 📂 Repository Structure

```
├── .github/workflows/   # GitHub Actions CI/CD pipelines
├── Jenkinsfile          # Jenkins declarative pipeline
├── k8s/                 # Kubernetes YAML manifests
│   ├── api.yaml         # Node.js API Deployment & Service
│   ├── hpa.yaml         # Horizontal Pod Autoscaler
│   ├── mongodb.yaml     # MongoDB Deployment & ClusterIP Service
│   └── secret.yaml      # Environment secrets (MongoDB URI)
├── src/                 # Node.js Application source code
├── tests/               # Jest Unit Tests
├── Dockerfile           # Multi-stage Docker build
└── package.json         # Node.js dependencies
```

## 🧪 Try the API

You can test the live API via `curl` or Postman:

**Create a new Task:**
```bash
curl -X POST https://cicd.snenmh.xyz/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test from GitHub","priority":"high","status":"done"}'
```

**List all Tasks:**
```bash
curl https://cicd.snenmh.xyz/api/tasks
```
