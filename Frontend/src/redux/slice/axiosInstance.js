import axios from "axios";
import { API_BASE_URL } from "../../config";

// ✅ Create axios instance with proper configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // ✅ Essential for cookies
  headers: {
    'Content-Type': 'application/json',
  }
});

// ✅ Request interceptor (optional: for debugging)
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Response interceptor (optional: for debugging)
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Response Error:', error.response?.status, error.config?.url);
    return Promise.reject(error);
  }
);

export default axiosInstance;