// Import the custom Axios instance
import axiosInstance from './custom-axios';
import store from '../store';

// Define API functions
const backendServices = {
  async login(pin) {
    try {
      const response = await axiosInstance.post('/api/users/login/', {
        pin: pin
      });
      return response.data;
    } catch (error) {
      // Handle error
      console.error('Error in login:', error);
      throw error;
    }
  },

  async fetchRooms() {
    try {
      const response = await axiosInstance.get('/api/tables/rooms/', {
        headers: {
          'accept': 'application/json',
          'X-PIN': store.getters['auth/GET_USERNAME']
        }
      });
      return response.data;
    } catch (error) {
      // Handle error
      console.error('Error fetching rooms:', error);
      throw error;
    }
  },

  async fetchTablesByHallId(id) {
    try {
      const response = await axiosInstance.get(`/api/tables/${id}/tables/`, {
        headers: {
          'accept': 'application/json',
          'X-PIN': store.getters['auth/GET_USERNAME']
        }
      }); 
      return response.data;
    } catch (error) {
      // Handle error
      console.error(`Error fetching tables for ID ${id}:`, error);
      throw error;
    }
  }

  // Define other API functions here
};


export default backendServices;
