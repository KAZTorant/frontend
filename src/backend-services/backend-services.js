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
  },

  async createOrder(tableId) {
    try {
      const response = await axiosInstance.post(`/api/orders/${tableId}/create/`, null, {
        headers: {
          'accept': 'application/json',
          'X-PIN': store.getters['auth/GET_USERNAME']
        }
      });
      return response.data;
    } catch (error) {
      // Handle error
      console.error(`Error creating order for table ID ${tableId}:`, error);
      throw error;
    }
  },

  async listOrderItems(tableId) {
    try {
      const response = await axiosInstance.get(`/api/orders/${tableId}/list-order-items/`, {
        headers: {
          'accept': 'application/json',
          'X-PIN': store.getters['auth/GET_USERNAME']
        }
      });
      return response.data;
    } catch (error) {
      // Handle error
      console.error(`Error listing order items for table ID ${tableId}:`, error);
      throw error;
    }
  },

  async fetchMealCategories() {
    try {
      const response = await axiosInstance.get('/api/meals/categories/', {
        headers: {
          'accept': 'application/json',
          'X-PIN': store.getters['auth/GET_USERNAME']
        }
      });
      return response.data;
    } catch (error) {
      // Handle error
      console.error('Error fetching meal categories:', error);
      throw error;
    }
  },

  async fetchMealsByCategoryId(categoryId) {
    try {
      let url = `/api/meals/meals/`;
      if(categoryId !== undefined)
        url = `/api/meals/meals/?meal_category_id=${categoryId}`;

      const response = await axiosInstance.get(url, {
        headers: {
          'accept': 'application/json',
          'X-PIN': store.getters['auth/GET_USERNAME']
        }
      });
      return response.data;
    } catch (error) {
      // Handle error
      console.error(`Error fetching meals for category ID ${categoryId}:`, error);
      throw error;
    }
  },

  async addOrderItem(tableId, mealId, quantity) {
    try {
        const response = await axiosInstance.post(`/api/orders/${tableId}/add-order-item/`, {
            meal_id: mealId,
            quantity: quantity
        }, {
            headers: {
                'accept': 'application/json',
                'X-PIN': store.getters['auth/GET_USERNAME'],
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    } catch (error) {
        // Handle error
        console.error(`Error adding order item for order ID ${orderId}:`, error);
        throw error;
    }
},

  // Define other API functions here
};


export default backendServices;
