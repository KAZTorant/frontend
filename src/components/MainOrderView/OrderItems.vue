<template>
  <div class="order-items-container">
    <div class="order-container">
      <!-- Display mainOrder if it exists -->
      <div v-if="mainOrder" class="order-item-box main-order">
        <div class="order-item-header">
          <button class="order-button" @click="toggleDropdown(mainOrder.pk)">
            <span>
              <font-awesome-icon class="order-icon" :class="{ rotated: showDropdown === mainOrder.pk, closed: showDropdown !== mainOrder.pk }" icon="angle-right" />
            </span>
            Sifariş {{ mainOrder.pk }} (Əsas)
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

      <!-- Display otherOrders -->
      <div class="button-container">
        <div v-for="item in otherOrders" :key="item.pk" class="order-item-button order-item-box">
          <button class="order-button" @click="toggleDropdown(item.pk)">
            <span>
              <font-awesome-icon class="order-icon" :class="{ rotated: showDropdown === item.pk, closed: showDropdown !== item.pk }" icon="angle-right" />
            </span>
            Sifariş {{ item.pk }}
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

      <!-- Only display Default order if there is no mainOrder and no otherOrders -->
      <div v-if="!mainOrder && otherOrders.length === 0" class="order-item-box">
        <div class="order-item-header">
          <button class="order-button" @click="toggleDropdown('default')">
            <span>
              <font-awesome-icon class="order-icon" :class="{ rotated: showDropdown !== 'default', closed: showDropdown === 'default' }" icon="angle-right" />
            </span>
            Sifariş (Əsas)
          </button>
        </div>
        <OrderDropdown
          v-if="showDropdown !== 'default'"
          :show-dropdown="showDropdown !== 'default'"
          :order-items="orderItems"
          :total-price="totalPrice"
          :check-view-permission-for-admin="checkViewPermissionForAdmin"
          :increment-quantity="incrementQuantity"
          :decrement-quantity="decrementQuantity"
        />
      </div>
    </div>
  </div>
</template>

<script>
import OrderDropdown from './OrderDropdown.vue';
import backendServices from '../../backend-services/backend-services';
import { EventBus } from '../../EventBus';
import store from '../../store';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';

library.add(faAngleRight);

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
    await this.fetchOrders(); 
    await this.fetchOrderItems(); 

    if (this.mainOrder) {
      this.showDropdown = this.mainOrder.pk; 
    }
    EventBus.on('orderItemAdded', this.handleOrderItemAdded); 

  },
  beforeUnmount() {
    EventBus.off('orderItemAdded', this.handleOrderItemAdded);
  },
  methods: {
    checkViewPermissionForAdmin() {
      return store.getters['auth/GET_ROLE'] === 'restaurant';
    },
    async toggleDropdown(orderId) {
      // If the clicked order is already open, close it
      if (this.showDropdown === orderId) {
        this.showDropdown = null; 
        EventBus.emit('selectedOrderId', null);
      } else {
        // Close any open dropdown and open the clicked one
        this.showDropdown = orderId;
        EventBus.emit('selectedOrderId', orderId);

        // Check if items are already loaded for the selected order
        if (this.orderItems.length === 0 || this.selectedOrderId !== orderId) {
          await this.fetchOrderItems(orderId);
        }
      }
    },
    async incrementQuantity(item) {
      try {
        await backendServices.addOrderItem(this.tableId, item.meal.id, 1, item.orderId);
        item.quantity++;
        this.fetchOrderItems(item.orderId); 
        EventBus.emit('orderItemAdded');
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
          EventBus.emit('orderItemAdded');
        } catch (error) {
          console.error('Error deleting order item:', error);
        }
      }
    },
    async fetchOrders() {
      try {
        const orders = await backendServices.listOrders(this.tableId);
        this.mainOrder = orders.find(order => order.is_main);
        this.otherOrders = orders.filter(order => !order.is_main);
        if (this.mainOrder && this.otherOrders.length === 0) {
          this.showDropdown = this.mainOrder.pk;
        } 
      } catch (error) {
        console.error('Error fetching orders:', error);
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
    },
    async handleOrderItemAdded() {
      await this.fetchOrders();
      await this.fetchOrderItems(); 
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
.order-item-box{
  background-color: #efefef;
}
.order-container {
  display: flex;
  flex-direction: column;
  justify-content: center; 
  padding: 10px 5px;
}
.main-order{
  margin-bottom: 10px ;
}


.button-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.order-button {
  background-color: #efefef;
  color: black;
  font-weight: 500;
  border: none;
  padding: 20px;
  font-size: 20px;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 30px;
}

.order-button span .order-icon {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: black;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  transition: transform 0.3s ease; 
}

.order-button span .order-icon.rotated {
  transform: rotate(90deg);
  transition: transform 0.3s ease;
}

.order-button span .order-icon.closed {
  transform: rotate(0deg);
  transition: transform 0.3s ease;
}

@media (max-width: 768px) {
  .order-items-container {
    height: 310px;
  }
}
</style>
