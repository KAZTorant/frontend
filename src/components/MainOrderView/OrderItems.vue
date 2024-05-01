<template>
  <div class="order-items-container">
    <div class="order-item-menu sticky">
      <div class="order-items-header">
        <span>Name</span>
        <span>Count</span>
        <span>Price</span>
        <span>Total</span>
      </div>
      <div class="order-total">
        <span>Total:</span>
        <span>{{ totalPrice | currency }}</span>
      </div>
    </div>
    <div class="order-items-list">
      <div class="order-item" v-for="item in orderItems" :key="item.meal.id">
        <span>{{ item.meal.name }}</span>
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
      orderItems: [

      ]
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
    async fetchOrderItems() {
      try {
        // Assuming the table ID is passed as a prop named "tableId"
        const response = await backendServices.listOrderItems(this.tableId);
        this.orderItems = response; // Update the orderItems data with the fetched items
        console.log("-------");

        console.log(this.orderItems);
      } catch (error) {
        console.error('Error fetching order items:', error);
        // Handle error as needed
      }
    }
  },
  computed: {
    totalPrice() {
      return this.orderItems.reduce((acc, item) => acc + item.count * item.price, 0);
    }
  },
  filters: {
    currency(value) {
      return `$${value.toFixed(2)}`; // Format as currency, assuming USD for demonstration
    }
  }
};
</script>

<style scoped>
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
  grid-template-columns: repeat(4, 1fr);
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