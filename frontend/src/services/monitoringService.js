import axios from "axios";
import { getApiBaseUrl } from "./settings";

function monitoringBase() {
  return getApiBaseUrl().replace(/\/api$/, "") + "/api/monitoring";
}

export const getClusterMetrics = () => axios.get(`${monitoringBase()}/cluster`);
export const getNodeMetrics = () => axios.get(`${monitoringBase()}/nodes`);
export const getPodMetrics = () => axios.get(`${monitoringBase()}/pods`);
export const getStorage = () => axios.get(`${monitoringBase()}/storage`);
export const getNetwork = () => axios.get(`${monitoringBase()}/network`);
export const getHealth = () => axios.get(`${getApiBaseUrl()}/health`);
