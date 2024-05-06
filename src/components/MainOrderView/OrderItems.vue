<template>
  <div class="order-items-container">
    <div class="order-item-menu sticky">
      <div class="order-items-header">
        <span class="tables-view" @click="goToTablesView()">Stollar</span>
        <span>Name</span>
        <span>Count</span>
        <span>Price</span>
        <span>Total</span>
      </div>
      <div class="order-total">
        <span>Total:</span>
        <span>{{ totalPrice }} azn</span>
      </div>
    </div>
    <div class="order-items-list">
      <div class="order-item" v-for="item in orderItems" :key="item.meal.id">
        <span>{{ item.meal.name }}</span>
        <span class="quantity-container">
      <button v-if=checkViewPermissionForAdmin() @click="decrementQuantity(item)">-</button>
      <span class="quantity">{{ item.quantity }}</span>
      <button @click="incrementQuantity(item)">+</button>
    </span>
        <span>{{ item.quantity }}</span>
        <span>{{ item.meal.price }} | azn</span>
        <span>{{ (item.quantity * item.meal.price) }} | azn</span>
      </div>
    </div>
  </div>
</template>

<script>
import backendServices from '../../backend-services/backend-services';
import { EventBus } from '../../EventBus';
import store from '../../store';
import router  from '../../router/'; // Import the router instance

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
      orderItems: [],
    };
  },
  created() {
    // Fetch order items when the component is created
    this.fetchOrderItems();

    EventBus.on('orderItemAdded', () => {
      this.fetchOrderItems(); // Refresh order items
    });
  },
  methods: {
    checkViewPermissionForAdmin(){
      return store.getters['auth/GET_ROLE'] === 'restaurant';
    },

    goToTablesView(){
      router.push(`/home`);
    },

    async decrementQuantity(item) {
      if (item.quantity > 0) {
        item.quantity--; // Decrement the quantity locally
        try {
          // Call backend service to remove order item
          await backendServices.deleteOrderItem(this.tableId, item.meal.id, 1);
          this.fetchOrderItems();
        } catch (error) {
          console.error('Error deleting order item:', error);
          // Revert the local quantity change if there's an error
          item.quantity++;
        }
      }
    },
    async incrementQuantity(item) {
      item.quantity++; // Increment the quantity locally
      try {
        // Call backend service to add order item
        await backendServices.addOrderItem(this.tableId, item.meal.id, 1);
        this.fetchOrderItems();
      } catch (error) {
        console.error('Error adding order item:', error);
        // Revert the local quantity change if there's an error
        item.quantity--;
      }
    },
    async fetchOrderItems() {
      try {
        // Assuming the table ID is passed as a prop named "tableId"
        const response = await backendServices.listOrderItems(this.tableId);
        this.orderItems = response; // Update the orderItems data with the fetched items
      } catch (error) {
        console.error('Error fetching order items:', error);
        // Handle error as needed
      }
    }
  },
  computed: {
    totalPrice() {
    const total = this.orderItems.reduce((acc, item) => acc + item.quantity * item.meal.price, 0);
    return total; // Ensure two decimal places
  }
  },
};
</script>

<style scoped>
.tables-view{
  background-color: orange;
  font-weight: bold;
}


.quantity-container {
  display: flex;
  align-items: center;
}

.quantity {
  padding: 0 10px; /* Adjust padding as needed */
  font-size: 1.2em; /* Adjust font size as needed */
  border: 1px solid #ccc; /* Add border for better visibility */
  border-radius: 5px; /* Add border radius for rounded corners */
  min-width: 30px; /* Adjust minimum width as needed */
  text-align: center; /* Center the quantity text */
}

.order-item button {
  font-size: 1.5em; /* Adjust the font size as needed */
  padding: 10px; /* Adjust the padding for button size */
}

.order-items-container {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
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

.order-items-header,
.order-item,
.order-total {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  align-items: center;
}

.order-items-header span,
.order-item span,
.order-total span {
  display: flex;
  justify-content: center;
  padding: 10px;
  border-bottom: 1px solid #ccc;
}

.order-items-header {
  font-weight: bold;
  border-bottom: 2px solid #ccc;
  /* Makes the header border thicker */
}

.order-total {
  border-top: 2px solid #ccc;
  font-weight: bold;
  margin-top: 10px;
  padding-top: 10px;
}
</style>