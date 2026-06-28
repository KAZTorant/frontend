import axios from 'axios';
import { getApiBaseUrl } from '../config/app.config';

const apiBaseURL = getApiBaseUrl();

const axiosInstance = axios.create({
  baseURL: apiBaseURL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default axiosInstance;
