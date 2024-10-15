<template>
  <div class="order-items-container">
    <div v-if="(mainOrder && mainOrder.pk === 1) || otherOrders.length > 0" class="order-container">

      <div v-if="mainOrder" class="order-item-box main-order">
        <div class="order-item-header">
          <button class="order-button" @click="toggleDropdown(mainOrder.pk)">
            <span v-if="showDropdown === mainOrder.pk">&#9650;</span>
            <span v-else>&#9660;</span>
            Masa {{ mainOrder.pk }} (Əsas Masa)
          </button>
        </div>

        <OrderDropdown
          v-if="showDropdown === mainOrder.pk"
          :show-dropdown="showDropdown === mainOrder.pk"
          :order-items="orderItems"
          :total-price="totalPrice"
          :check-view-permission-for-admin="checkViewPermissionForAdmin"
          :increment-quantity="incrementQuantity"
          :decrement-quantity="decrementQuantity"
        />
      </div>
        
      <div class="button-container">
        <div v-for="item in otherOrders" :key="item.pk" class="order-item-button">
          <button class="order-button" @click="toggleDropdown(item.pk)">
            <span v-if="showDropdown === item.pk">&#9650;</span>
            <span v-else>&#9660;</span>
            Masa {{ item.pk }}
          </button>

          <OrderDropdown
            v-if="showDropdown === item.pk"
            :show-dropdown="showDropdown === item.pk"
            :order-items="orderItems"
            :total-price="totalPrice"
            :check-view-permission-for-admin="checkViewPermissionForAdmin"
            :increment-quantity="incrementQuantity" 
            :decrement-quantity="decrementQuantity"
          />
        </div>
      </div>
    </div>

    <div v-else>
      <OrderDropdown
        :show-dropdown="true"
        :order-items="orderItems"
        :total-price="totalPrice"
        :check-view-permission-for-admin="checkViewPermissionForAdmin"
        :increment-quantity="incrementQuantity"
        :decrement-quantity="decrementQuantity"
      />
    </div>
  </div>
</template>

<script>
import OrderDropdown from './OrderDropdown.vue';
import backendServices from '../../backend-services/backend-services';
import { EventBus } from '../../EventBus';
import store from '../../store';

export default {
  name: 'OrderItems',
  components: {
    OrderDropdown,
  },
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
      showDropdown: null,
      selectedOrderId: null,
    };
  },
  async created() {
    try {
      const orders = await backendServices.listOrders(this.tableId);
      this.mainOrder = orders.find(order => order.is_main);
      this.otherOrders = orders.filter(order => !order.is_main);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }

    await this.fetchOrderItems();
    EventBus.on('orderItemAdded', this.fetchOrderItems);
  },
  beforeUnmount() {
    EventBus.off('orderItemAdded', this.fetchOrderItems);
  },
  methods: {
    checkViewPermissionForAdmin() {
      return store.getters['auth/GET_ROLE'] === 'restaurant';
    },
    async toggleDropdown(orderId) {
    if (this.showDropdown === orderId) {
      this.showDropdown = null;
      EventBus.emit('selectedOrderId', null);
      return;
    }
    
    this.showDropdown = orderId;
    EventBus.emit('selectedOrderId', orderId);
    
    // Check if items are already loaded for the selected order
    if (this.orderItems.length === 0 || this.selectedOrderId !== orderId) {
      await this.fetchOrderItems(orderId);
    }
  },
  async incrementQuantity(item) {
      try {
        await backendServices.addOrderItem(this.tableId, item.meal.id, 1, item.orderId);
        item.quantity++;
        this.fetchOrderItems(item.orderId); 
      } catch (error) {
        console.error('Error adding order item:', error);
      }
    },
    
    async decrementQuantity(item) {
      if (item.quantity > 0) {
        try {
          await backendServices.deleteOrderItem(this.tableId, item.meal.id, 1, item.orderId);
          item.quantity--;
          this.fetchOrderItems(item.orderId); 
        } catch (error) {
          console.error('Error deleting order item:', error);
        }
      }
    },
    async fetchOrderItems(orderId = null) {
      try {
          const selectedOrderId = orderId || this.showDropdown; 
          const response = await backendServices.listOrderItems(this.tableId, selectedOrderId);
          this.orderItems = response.map(item => ({
            ...item,
            orderId: selectedOrderId 
          }));
      } catch (error) {
          console.error('Sifariş məlumatları yüklənərkən xəta baş verdi:', error);
      }
    }
  },
  computed: {
    totalPrice() {
      return this.orderItems.reduce((acc, item) => acc + item.quantity * item.meal.price, 0);
    }
  },
};
</script>

<style scoped>

.order-items-container {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  border-top: 1px solid #ccc;
}

.order-container {
  display: flex;
  flex-direction: column;
  justify-content: center; 
  gap: 5px;
  padding: 5px;
}

.button-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.order-button {
  background-color: #efefef;
  color: black;
  font-weight: 500;
  border: none;
  padding: 15px 30px;
  font-size: 20px;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.3s;
  display:flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.order-button:hover {
  background-color: #e2e2e2;
}


.order-button span {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background-color: black;
  color: white;
  border-radius: 50%;
  transition: transform 0.3s ease-in-out; 
  cursor: pointer; 
  font-size: 18px;
}
@media (max-width: 768px) {
  .order-items-container {
    height: 310px;
  }
}
</style>
