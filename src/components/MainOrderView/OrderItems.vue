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
        <div class="order-item" v-for="item in orderItems" :key="item.id">
          <span>{{ item.name }}</span>
          <span>{{ item.count }}</span>
          <span>{{ item.price | currency }}</span>
          <span>{{ (item.count * item.price) | currency }}</span>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'OrderItems',
    data() {
      return {
        orderItems: [
          // Populate this array with your order items
          // Example: { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger Burger Burger Burger Burger Burger Burger', count: 2, price: 5.00 },

          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },{ id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },{ id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },{ id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },{ id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },{ id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },{ id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },{ id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },{ id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },{ id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
          { id: 1, name: 'Burger', count: 2, price: 5.00 },
        ]
      };
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
    top: 0; /* Adjust if you have a top bar */
    background-color: white; /* Or the color of your app's background */
    z-index: 10;
  }
  
  .order-items-list {
    overflow-y: auto;
  }
  
  .order-items-header, .order-item, .order-total {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    align-items: center;
  }
  
  .order-items-header span, .order-item span, .order-total span {
    display: flex;
    justify-content: center;
    padding: 10px;
    border-bottom: 1px solid #ccc;
  }
  
  .order-items-header {
    font-weight: bold;
    border-bottom: 2px solid #ccc; /* Makes the header border thicker */
  }
  
  .order-total {
    border-top: 2px solid #ccc;
    font-weight: bold;
    margin-top: 10px;
    padding-top: 10px;
  }
  </style>
  