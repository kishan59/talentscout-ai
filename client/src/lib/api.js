import axios from 'axios';
import { useAuth } from '@clerk/nextjs';

// 1. Create a generic Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Point to your Express Server
});

// 2. A Custom Hook to use the API (Because we need the 'useAuth' hook)
export const useApi = () => {
  const { getToken } = useAuth();

  // Interceptor: Before request is sent...
  api.interceptors.request.use(async (config) => {
    // ...get the fresh Clerk Token
    const token = await getToken();
    
    // ...and attach it to the header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return api;
};

export default api;