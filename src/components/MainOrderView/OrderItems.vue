<template>
  <div class="order-items-container">
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
      <button v-if=checkViewPermissionForAdmin() @click="decrementQuantity(item)">-</button>
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
  transition: all 0.3s ease-in-out
}
.tables-view:hover{
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
  display:flex;
  justify-content: center;
  align-items: center;
  padding: 100px 0;
  font-size: 18px;
  color: #333;
  font-weight: 700;
  background-color: #f0f0f0;
}

.order-items-header,
.order-item{
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
.order-item span{
  border-bottom: 1px solid #ccc;
  padding: 10px;
}
.order-item span{
  min-height: 60px;
  height: 60px;
}

.quantity {
  padding: 4px 8px !important; /* Adjust padding as needed */
  font-size: 1.2em; /* Adjust font size as needed */
  border: 1px solid #ccc; /* Add border for better visibility */
  border-radius: 5px; /* Add border radius for rounded corners */
  min-width: 20px; /* Adjust minimum width as needed */
  text-align: center; /* Center the quantity text */
}
.order-items-header {
  font-weight: bold;
  /* Makes the header border thicker */
}

.order-total {
  font-weight: bold;
}
@media (max-width: 768px) {
  .order-items-container{
    height: 310px;
  }
  .empty-message{
    height: 235px;
    padding: 0;
  }
}
</style>