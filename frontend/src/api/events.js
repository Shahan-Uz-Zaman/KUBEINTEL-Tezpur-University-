import axios from "axios";
import { getApiBaseUrl } from "../services/settings";

export const getEvents = async (namespace = "default") => {
  const response = await axios.get(`${getApiBaseUrl()}/events`, {
    params: { namespace },
  });
  return response.data.events;
};
