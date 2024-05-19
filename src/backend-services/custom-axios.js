import axios from 'axios';
import store from '../store';

const axiosInstance = axios.create({
  baseURL: `${window.location.protocol}//${window.location.hostname}:8000`, // Set your base URL
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
