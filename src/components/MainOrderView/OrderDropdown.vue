<template>
  <div class="order-dropdown" v-if="showDropdown">
    
      <!-- <span>Cəmi: <span>{{ totalPrice }} azn</span></span> -->
      <div
        class="selected-controls"
        v-if="selectedItem"
      >
        <div class="quantity-container">
          <button v-if="checkViewPermissionForAdmin()" @click="decrementQuantity(selectedItem)" class="btn-decrement">
            <font-awesome-icon icon="minus" />
          </button>
          <button
            @click="incrementQuantity(selectedItem)"
            class="btn-increment"
          >
            <font-awesome-icon icon="plus" />
          </button>
        </div>
      </div>
    <div class="order-item-menu sticky">
      <div class="order-items-header">
        <span>Adı</span>
        <span>Sayı</span>
        <span>Qiyməti</span>
        <span>Cəmi</span>
        <span>Status</span>
      </div>
    </div>

    <div class="order-items-list">
      <div v-if="orderItems.length === 0" class="empty-message">
        <p>Yemək əlavə etməmisiniz.</p>
      </div>
      <div
        class="order-item"
        v-for="item in orderItems"
        :key="item.meal.id"
        @click="selectItem(item)"
        :class="{ active: selectedItem && selectedItem.meal.id === item.meal.id }"
      >
        <span>{{ item.meal.name }}</span>
        <div class="quantity">{{ item.quantity }}</div>
        <span>{{ item.meal.price }} azn</span>
        <span>{{ (item.quantity * item.meal.price) }} azn</span>
        <span
          class="status-indicator"
          :class="item.confirmed ? 'confirmed' : 'waiting'"
        >
          <font-awesome-icon :icon="item.confirmed ? 'check' : 'hourglass-half'" />
        </span>
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
  data() {
    return {
      selectedItem: null,
    };
  },
  methods: {
    selectItem(item) {
      this.selectedItem = item;
    },
  },
};
</script>

<style scoped>
.order-dropdown {
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  margin: 10px 15px 15px;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid #2ecc71;
  overflow: hidden;
  position: relative;
}

.quantity-container {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 10px;
}

.order-item button,
.quantity-container button {
  width: 44px;
  height: 44px;
  font-size: 1.3em;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-decrement {
  background: linear-gradient(135deg, #ff6b6b, #ff5252);
}

.btn-increment {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
}

.btn-decrement:hover {
  background: linear-gradient(135deg, #ff5252, #ff1744);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 82, 82, 0.3);
}

.btn-increment:hover {
  background: linear-gradient(135deg, #27ae60, #219653);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(46, 204, 113, 0.3);
}

.sticky {
  position: sticky;
  top: 0;
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  z-index: 10;
  border-radius: 16px 16px 0 0;
  border-bottom: 1px solid #e9ecef;
  backdrop-filter: blur(10px);
}

.order-items-list {
  overflow-y: auto;
  max-height: 400px;
  padding: 15px 0;
}

.empty-message {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100px 0;
  font-size: 1.1em;
  color: #6c757d;
  font-weight: 600;
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
}
.order-items-header,
.order-item {
  display: grid;
  grid-template-columns: 150px repeat(4, minmax(50px, 1fr));
  align-items: center;
  gap: 10px;
  padding: 0 15px;
  cursor: pointer;
}

.order-item:hover {
  background-color: #f1f3f5;
}

.order-item.active {
  background-color: #d1f7e2;
}

.order-total {
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  font-weight: 600;
  color: #2c3e50;
  position: sticky;
  bottom: 0;
  backdrop-filter: blur(10px);
}

.order-items-header span,
.order-item span,
.order-total span {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1em;
}

.order-items-header span,
.order-item span {
  min-height: 60px;
  height: 60px;
  color: #2c3e50;
}

.quantity {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px 8px;
  font-size: 1.1em;
  font-weight: 600;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  min-width: 32px;
  height: 32px;
  text-align: center;
  background: white;
  margin: 0 auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.order-total span {
  font-size: 1.2em;
  color: #2ecc71;
}

.status-indicator {
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 8px;
  text-align: center;
  background: #f8d7da;
  color: #721c24;
  font-size: 0.9em;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 3px 0;
}

.status-indicator.confirmed {
  background: #d4edda;
  color: #155724;
}

.status-indicator.waiting {
  background: #fff3cd;
  color: #856404;
}

.selected-controls {
  padding: 8px 15px 15px; 
  text-align: center;
  border-bottom: 1px solid #e9ecef;
}

.selected-name {
  font-size: 1.1em;
  margin-bottom: 8px;
  color: #2c3e50;
}
</style>
