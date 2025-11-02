import axios from 'axios';
import store from '../store';

// Construct API base URL from separate host and port
const apiHost = process.env.VUE_APP_API_HOST || '0.0.0.0';
const apiPort = process.env.VUE_APP_API_PORT || '8000';
const apiProtocol = process.env.VUE_APP_API_PROTOCOL || 'http';
const apiBaseURL = `${apiProtocol}://${apiHost}:${apiPort}`;

const axiosInstance = axios.create({
  baseURL: apiBaseURL, // Set your base URL
  timeout: 5000, // Set a timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// You can also add interceptors if needed
axiosInstance.interceptors.request.use(
  (config) => {
    // Do something before request is sent
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    // Do something with response data
    return response;
  },
  (error) => {
    // Do something with response error
    return Promise.reject(error);
  }
);

export default axiosInstance;
