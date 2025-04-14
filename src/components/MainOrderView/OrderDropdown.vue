<template>
    <div class="order-dropdown" v-if="showDropdown">
      <div class="order-total">
        <span>Cəmi:<span>{{ totalPrice }} azn</span></span>
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
        <div class="order-item" v-for="item in orderItems" :key="item.meal.id">
          <span>{{ item.meal.name }}</span>
          <span class="quantity-container">
            <button v-if="checkViewPermissionForAdmin()" @click="decrementQuantity(item)" class="btn-decrement">
              <font-awesome-icon icon="minus" />
            </button>
            <div class="quantity">{{ item.quantity }}</div>
            <button @click="incrementQuantity(item)" class="btn-increment">
              <font-awesome-icon icon="plus" />
            </button>
          </span>

          <span>{{ item.meal.price }} azn</span>
          <span>{{ (item.quantity * item.meal.price) }} azn</span>
          <span class="status-indicator" :class="{ 'confirmed': item.confirmed }">
            {{ item.confirmed ? 'Təsdiqlənib' : 'Gözləyir' }}
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
  };
  </script>
  

<style scoped>
.order-dropdown {
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  margin: 0 15px 15px;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  overflow: hidden;
  position: relative;
}

.order-dropdown::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2ecc71, #27ae60);
  opacity: 0.8;
}

.quantity-container {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.order-item button {
  width: 32px;
  height: 32px;
  font-size: 1em;
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
}

.order-total {
  border-bottom: 1px solid #e9ecef;
  padding: 15px;
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
  padding: 12px 0;
}

.order-items-header span,
.order-item span {
  border-bottom: 1px solid #e9ecef;
}

.order-item span {
  gap: 5px;
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.order-items-header {
  font-weight: 600;
  color: #2c3e50;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
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
  transition: all 0.3s ease;
}

.status-indicator.confirmed {
  background: #d4edda;
  color: #155724;
}

@media (max-width: 1024px) {
  .order-items-header,
  .order-item {
    grid-template-columns: 120px repeat(4, minmax(40px, 1fr));
    gap: 8px;
    padding: 0 12px;
  }

  .order-item span {
    font-size: 0.95em;
  }
}

@media (max-width: 768px) {
  .order-dropdown {
    margin: 0 10px 10px;
    border-radius: 12px;
  }

  .empty-message {
    height: 200px;
    padding: 0;
    font-size: 1em;
  }

  .order-items-header,
  .order-item {
    grid-template-columns: 100px repeat(4, minmax(35px, 1fr));
    gap: 5px;
    padding: 0 10px;
  }

  .order-item span {
    font-size: 0.9em;
    min-height: 50px;
    height: 50px;
  }

  .quantity {
    min-width: 28px;
    height: 28px;
    font-size: 1em;
  }

  .order-item button {
    width: 28px;
    height: 28px;
  }

  .order-total {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .order-items-header,
  .order-item {
    grid-template-columns: 80px repeat(4, minmax(30px, 1fr));
    gap: 4px;
    padding: 0 8px;
  }

  .order-item span {
    font-size: 0.85em;
    min-height: 45px;
    height: 45px;
  }

  .quantity {
    min-width: 24px;
    height: 24px;
    font-size: 0.9em;
  }

  .order-item button {
    width: 24px;
    height: 24px;
  }

  .order-total {
    padding: 10px;
  }

  .order-total span {
    font-size: 1.1em;
  }
}
</style>
