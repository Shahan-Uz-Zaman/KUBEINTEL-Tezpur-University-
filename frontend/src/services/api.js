import axios from "axios";
import { getApiBaseUrl, loadSettings } from "./settings";

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Always use latest API URL from settings
api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  return config;
});

export const getDashboard = () => api.get("/dashboard");
export const getNodes = () => api.get("/nodes");
export const getPods = () => api.get("/pods");
export const getNamespaces = () => api.get("/namespaces");
export const getCluster = () => api.get("/cluster");
export const getHealth = () => api.get("/health");
export const getRecommendations = () => api.get("/recommendations");
export const getEvents = () => api.get("/events");
export const getLogs = (params) => api.get("/logs", { params });

export const getDeployments = async () => {
  return await api.get("/deployments");
};

export const createDeployment = async (data) => {
  return await api.post("/deployments", data);
};

export const deleteDeployment = async (name) => {
  return await api.delete(`/deployments/${name}`);
};

export const restartDeployment = async (name) => {
  return await api.post(`/deployments/${name}/restart`);
};

export const scaleDeployment = async (name, replicas) => {
  return await api.put(`/deployments/${name}/scale`, {
    namespace: "default",
    replicas,
  });
};

export function testConnection(apiUrl) {
  const base = (apiUrl || loadSettings().apiUrl || "http://localhost:8080").replace(
    /\/$/,
    ""
  );
  return axios.get(`${base}/api/health`, { timeout: 5000 });
}

export default api;
