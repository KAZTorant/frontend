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

  async listOrderItems(tableId, orderId) {
    try {
      const response = await axiosInstance.get(`/api/orders/${tableId}/list-order-items/`, {
        headers: {
          'accept': 'application/json',
          'X-PIN': store.getters['auth/GET_USERNAME']
        },
        params: {
          order_id: orderId // Burada order_id parametrlər olaraq əlavə edilir
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error listing order items for table ID ${tableId} and order ID ${orderId}:`, error);
      throw error;
    }
  },  
  
  async listOrders(tableId) {
    try {
      const response = await axiosInstance.get(`/api/orders/${tableId}/list-orders/`, {
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
      if (categoryId !== undefined)
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

  async deleteOrderItem(tableId, mealId, quantity) {
    try {
      const response = await axiosInstance.delete(`/api/orders/${tableId}/delete-order-item/`, {
        headers: {
          'accept': 'application/json',
          'X-PIN': store.getters['auth/GET_USERNAME'],
          'Content-Type': 'application/json',
        },
        data: {
          meal_id: mealId,
          quantity: quantity
        }
      });
      return response.data;
    } catch (error) {
      // Handle error
      console.error(`Error deleting order item for order ID ${orderId}:`, error);
      throw error;
    }
  },

  async changeTableForOrder(oldTableId, newTableId) {
    try {
      const response = await axiosInstance.post(`/api/orders/${oldTableId}/change-table-for-order/`, {
        new_table_id: newTableId
      }, {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'X-PIN': store.getters['auth/GET_USERNAME']
        }
      });
      return response.data;
    } catch (error) {
      // Handle error
      console.error(`Error changing table for order ID ${orderId}:`, error);
      throw error;
    }
  },

  async closeTableForOrder(tableId) {
    try {
      const response = await axiosInstance.delete(`/api/orders/${tableId}/close-table-for-order/`, {
        headers: {
          'accept': 'application/json',
          'X-PIN': store.getters['auth/GET_USERNAME'],
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      // Handle error
      console.error(`Error closing table for order ID ${orderId}:`, error);
      throw error;
    }
  },

  async changeWaitressForOrder(tableId, newWaitressId) {
    try {
      const response = await axiosInstance.post(`/api/orders/${tableId}/change-waitress/`, {
        new_waitress_id: newWaitressId
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
      console.error(`Error changing waitress for the order with ID ${tableId}:`, error);
      throw error;
    }
  },

  async fetchWaitresses() {
    try {
      const response = await axiosInstance.get('/api/orders/list-waitress/', {
        headers: {
          'accept': 'application/json',
          'X-PIN': store.getters['auth/GET_USERNAME']
        }
      });
      return response.data;
    } catch (error) {
      // Handle error
      console.error('Error listing waitresses:', error);
      throw error;
    }
  },

  async printCheck(tableId) {
    try {
      const response = await axiosInstance.post(`/api/orders/${tableId}/print-check/`, null, {
        headers: {
          'accept': 'application/json',
          'X-PIN': store.getters['auth/GET_USERNAME']
        }
      });
      return response.data;
    } catch (error) {
      // Handle error
      console.error(`Error printing check for order ID ${tableId}:`, error);
      throw error;
    }
  },

  async combineTables(tableId, otherTableIds) {
    try {
      const response = await axiosInstance.post(`/api/orders/${tableId}/join-tables-orders/`, {
        other_table_ids: otherTableIds 
      }, {
        headers: {
          'accept': 'application/json',
          'X-PIN': store.getters['auth/GET_USERNAME']
        }
      });
      return response.data;
    } catch (error) {
      // Xətanı idarə et
      console.error(`Error printing check for order ID ${tableId}:`, error);
      throw error;
    }
  },
  

  async deleteCheck(tableId) {
    try {
      const response = await axiosInstance.delete(`/api/orders/${tableId}/print-check/`, {
        headers: {
          'accept': 'application/json',
          'X-PIN': store.getters['auth/GET_USERNAME']
        }
      });
      return response.data;
    } catch (error) {
      // Handle error
      console.error(`Error deleting check for order ID ${tableId}:`, error);
      throw error;
    }
  },


// Define a function to make the API call
async fetchTableDetails(tableId) {
  try {
    const response = await axiosInstance.get(`/api/tables/${tableId}/details`, {
      headers: {
        'accept': 'application/json',
        'X-PIN': store.getters['auth/GET_USERNAME']
      }
    });
    return response.data;
  } catch (error) {
    // Handle error
    console.error('Error fetching table details:', error);
    throw error;
  }
},
async getNetworkAddress() {
  try {
    const response = await axiosInstance.get(`/api/users/network-ip/`, {
      headers: {
        'accept': 'application/json',
        'X-PIN': store.getters['auth/GET_USERNAME']
      }
    });
    return response.data;
  } catch (error) {
    // Handle error
    console.error('Error fetching network address:', error);
    throw error;
  }
}
  // Define other API functions here
};


export default backendServices;
