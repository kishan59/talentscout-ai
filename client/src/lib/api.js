import axios from "axios";
import { useAuth } from "@clerk/nextjs";

// It checks the Environment Variable first. If missing, it falls back to localhost.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const useApi = () => {
  const { getToken } = useAuth();

  const api = axios.create({
    baseURL: BASE_URL+'/api',
  });

  api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return api;
};