<template>
    <div v-if="showDropdown">
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
  export default {
    props: {
      showDropdown: {
        type: Boolean,
        required: true,
      },
      orderItems: {
        type: Array,
        required: true,
      },
      totalPrice: {
        type: Number,
        required: true,
      },
      checkViewPermissionForAdmin: {
        type: Function,
        required: true,
      },
      incrementQuantity: {
        type: Function,
        required: true,
      },
      decrementQuantity: {
        type: Function,
        required: true,
      },
    },
  };
  </script>
  

<style scoped>
.quantity-container {
  display: flex;
  align-items: center;
}
.order-item button {
  width: 17px;
  font-size: 16px; /* Adjust the font size as needed */
  padding: 2px; /* Adjust the padding for button size */
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

@media (max-width: 768px) {
  .empty-message {
    height: 235px;
    padding: 0;
  }
}
</style>
