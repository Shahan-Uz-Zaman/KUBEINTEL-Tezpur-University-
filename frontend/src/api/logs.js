import axios from "axios";
import { getApiBaseUrl } from "../services/settings";

export const getNamespaces = async () => {
  const res = await axios.get(`${getApiBaseUrl()}/namespaces`);
  return res.data.namespaces ?? res.data;
};

export const getPods = async (namespace = "default") => {
  const res = await axios.get(`${getApiBaseUrl()}/pods`, {
    params: { namespace },
  });
  return res.data.pods ?? res.data;
};

export const getLogs = async (namespace, pod) => {
  const res = await axios.get(`${getApiBaseUrl()}/logs`, {
    params: { namespace, pod },
  });
  return res.data.logs ?? res.data;
};
