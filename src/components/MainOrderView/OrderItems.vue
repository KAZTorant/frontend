<template>
  <div class="order-items-container">
    <div v-if="!(mainOrder && mainOrder.is_main && otherOrders.length === 0)" class="order-container">
  <div v-if="mainOrder" class="order-item-box main-order">
    <div class="order-item-header">
      <button class="main-order-button">Masa {{ mainOrder.pk }} (Əsas Masa)</button>
    </div>
  </div>

  <!-- Qalan masalar (is_main: false) -->
  <div class="button-container">
    <div v-for="item in otherOrders" :key="item.pk" class="order-item-button">
      <button class="order-button">Masa {{ item.pk }}</button>
    </div>
  </div>
</div>

    
    <div class="order-total">
      <span>Cəmi:<span>{{ totalPrice }} azn</span></span>
    </div>
    <div class="order-item-menu sticky">
      <div class="order-items-header">
        <span>Adı</span>
        <span>Sayı</span>
        <span>Qiyməti</span>
        <span>Cəmi</span>
      </div>
    </div>
    <div class="order-items-list">
      <div v-if="orderItems.length === 0" class="empty-message">
        <p>Yemək əlavə etməmisiniz.</p>
      </div>
      <div class="order-item" v-for="item in orderItems" :key="item.meal.id">
        <span>{{ item.meal.name }}</span>
        <span class="quantity-container">
          <button v-if="checkViewPermissionForAdmin()" @click="decrementQuantity(item)">-</button>
          <div class="quantity">{{ item.quantity }}</div>
          <button @click="incrementQuantity(item)">+</button>
        </span>
        <span>{{ item.meal.price }} azn</span>
        <span>{{ (item.quantity * item.meal.price) }} azn</span>
      </div>
    </div>
  </div>
</template>

<script>
import backendServices from '../../backend-services/backend-services';
import { EventBus } from '../../EventBus';
import store from '../../store';
import router from '../../router/'; 

export default {
  name: 'OrderItems',
  props: {
    tableId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      mainOrder: null, 
      otherOrders: [],
      orderItems: [],
    };
  },
  async created() {
    try {
      // Calling listOrders via API
      const orders = await backendServices.listOrders(this.tableId);
      
      // Finding and separating the main order and other orders
      this.mainOrder = orders.find(order => order.is_main);
      this.otherOrders = orders.filter(order => !order.is_main);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }

    // Loading order items as well
    await this.fetchOrderItems();

    // Listen for 'orderItemAdded' event
    EventBus.on('orderItemAdded', this.fetchOrderItems);
  },
  beforeUnmount() {
    EventBus.off('orderItemAdded', this.fetchOrderItems);
  },
  methods: {
    checkViewPermissionForAdmin() {
      return store.getters['auth/GET_ROLE'] === 'restaurant';
    },
    async decrementQuantity(item) {
      if (item.quantity > 0) {
        item.quantity--;
        try {
          // API call to the backend service
          await backendServices.deleteOrderItem(this.tableId, item.meal.id, 1);
          this.fetchOrderItems();
        } catch (error) {
          console.error('Error deleting order item:', error);
          item.quantity++; // Revert the quantity on error
        }
      }
    },
    async incrementQuantity(item) {
      // Increasing quantity locally
      item.quantity++; 
      try {
        // API call to the backend service
        await backendServices.addOrderItem(this.tableId, item.meal.id, 1);
        this.fetchOrderItems();
      } catch (error) {
        console.error('Error adding order item:', error);
        item.quantity--;
      }
    },
    async fetchOrderItems() {
      try {
        // Fetching the order items
        const response = await backendServices.listOrderItems(this.tableId);
        this.orderItems = response;
      } catch (error) {
        console.error('Error fetching order items:', error);
      }
    }
  },
  computed: {
    totalPrice() {
      // Calculating the total price of order items
      const total = this.orderItems.reduce((acc, item) => acc + item.quantity * item.meal.price, 0);
      return total;
    }
  },
};
</script>

<style scoped>
.tables-view {
  background-color: orange;
  font-weight: bold;
  transition: all 0.3s ease-in-out
}
.tables-view:hover {
  background-color: #f7b845;
}
.quantity-container {
  display: flex;
  align-items: center;
}
.order-item button {
  width: 17px;
  font-size: 16px; /* Adjust the font size as needed */
  padding: 2px; /* Adjust the padding for button size */
}
.order-items-container {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  border-top: 1px solid #ccc;
}
.sticky {
  position: sticky;
  top: 0;
  /* Adjust if you have a top bar */
  background-color: white;
  /* Or the color of your app's background */
  z-index: 10;
}
.order-items-list {
  overflow-y: auto;
}
.empty-message {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100px 0;
  font-size: 18px;
  color: #333;
  font-weight: 700;
  background-color: #f0f0f0;
}
.order-items-header,
.order-item {
  display: grid;
  grid-template-columns: 150px repeat(3, minmax(50px, 1fr));
  align-items: center;
  gap: 4px;
}
.order-total {
  border-bottom: 1px solid #ccc;
  padding: 10px;
}
.order-total span {
  gap: 5px
}
.order-items-header span,
.order-item span,
.order-total span {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
}
.order-items-header span,
.order-item span {
  border-bottom: 1px solid #ccc;
  padding: 10px;
}
.order-item span {
  min-height: 60px;
  height: 60px;
}
.quantity {
  padding: 4px 8px !important;
  font-size: 1.2em;
  border: 1px solid #ccc;
  border-radius: 5px;
  min-width: 20px;
  text-align: center;
}
.order-items-header {
  font-weight: bold;
}
.order-total {
  font-weight: bold;
}
.order-container {
  display: flex;
  flex-direction: column;
  justify-content: center; 
  align-items: center; 
  gap: 5px;
  padding: 5px;
}

.button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.order-button, .main-order-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 20px 30px;
  font-size: 20px;
  border-radius: 5px;
  cursor: pointer;
  width: 300px;
  transition: background-color 0.3s;
}

.main-order-button {
  background-color: #008CBA;
}

.main-order-button:hover {
  background-color: #007B9A;
}

.order-button:hover {
  background-color: #45a049;
}

@media (max-width: 768px) {
  .order-items-container {
    height: 310px;
  }
  .empty-message {
    height: 235px;
    padding: 0;
  }
}
</style>
