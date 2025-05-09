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
            <span v-if="showDropdown === mainOrder.pk">
              Cəmi: <span>{{ totalPrice }} azn</span>
            </span>

            Sifariş {{ mainOrder.pk }}
          </button>
        </div>

        <OrderDropdown
          v-if="showDropdown === mainOrder.pk"
          :show-dropdown="showDropdown === mainOrder.pk"
          :order-items="orderItems"
          :total-price="totalPrice"
          :order-id="mainOrder?.pk"
          :table-id="tableId"
          :check-view-permission-for-admin="checkViewPermissionForAdmin"
          :increment-quantity="incrementQuantity"
          :decrement-quantity="decrementQuantity"
          @transfer-success="fetchOrderItems"
        />
      </div>

      <!-- Display otherOrders -->
      <div class="button-container">
        <div v-for="item in otherOrders" :key="item.pk" class="order-item-button order-item-box">
          <div class="order-item-header">
            <button class="order-button" @click="toggleDropdown(item.pk)">
              <span>
                <font-awesome-icon class="order-icon" :class="{ rotated: showDropdown === item.pk, closed: showDropdown !== item.pk }" icon="angle-right" />
              </span>
              <span v-if="showDropdown === item.pk">
                Cəmi: <span>{{ totalPrice }} azn</span>
              </span>

              Sifariş {{ item.pk }}
            </button>
          </div>

          <OrderDropdown
            v-if="showDropdown === item.pk"
            :show-dropdown="showDropdown === item.pk"
            :order-items="orderItems"
            :total-price="totalPrice"
            :order-id="item?.pk"
            :table-id="tableId"
            :check-view-permission-for-admin="checkViewPermissionForAdmin"
            :increment-quantity="incrementQuantity"
            :decrement-quantity="decrementQuantity"
            @transfer-success="fetchOrderItems"
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
            <span v-if="showDropdown !== 'default'">
              Cəmi: <span>{{ totalPrice }} azn</span>
            </span>
            Sifariş
          </button>
        </div>
        <OrderDropdown
          v-if="showDropdown !== 'default'"
          :show-dropdown="showDropdown !== 'default'"
          :order-items="orderItems"
          :total-price="totalPrice"
          :order-id="order?.id"
          :table-id="tableId"
          :check-view-permission-for-admin="checkViewPermissionForAdmin"
          :increment-quantity="incrementQuantity"
          :decrement-quantity="decrementQuantity"
          @transfer-success="fetchOrderItems"
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
import { faAngleRight, faTable } from '@fortawesome/free-solid-svg-icons';

library.add(faTable, faAngleRight);

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
  EventBus.on('order-confirmed', this.handleOrderItemAdded);
},
beforeUnmount() {
  EventBus.off('orderItemAdded', this.handleOrderItemAdded);
  EventBus.off('order-confirmed', this.handleOrderItemAdded);
},
  methods: {
    checkViewPermissionForAdmin() {
      const role = store.getters['auth/GET_ROLE'];
      return role === 'restaurant' || role === 'admin';
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
      const payload = {
        order_id: item.orderId,
        meal_id: item.meal.id,
        quantity: 1,
        order_item_id: item.order_item_id,
      };
      await backendServices.deleteOrderItem(this.tableId, payload);
      item.quantity--;
      this.fetchOrderItems(item.orderId); 
      EventBus.emit('orderItemAdded');
    } catch (error) {
      console.error('Error deleting order item:', error);
    }
  }

  if(item.quantity === 0){
        window.location.reload();
        return;
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
    },
    async handleTableClick(table) {
      console.log('Table button clicked:', table); // Debug log
      try {
        const tableResponse = await backendServices.fetchTableDetails(table.id);
        console.log('Table response:', tableResponse); // Debug log
        this.$emit('table-click', {
          id: table.id,
          status: tableResponse.status,
          number: tableResponse.number
        });
      } catch (error) {
        console.error('Error fetching table details:', error);
      }
    }
  },
  computed: {
    totalPrice() {
  return this.orderItems
    .reduce((acc, item) => acc + item.quantity * item.meal.price, 0)
    .toFixed(2);
}
  },
};
</script>

<style scoped>
.order-items-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 245, 245, 0.98));
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  overflow: hidden;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.order-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 15px;
  height: 100%;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #2ecc71 #f8f9fa;
}

.order-container::-webkit-scrollbar {
  width: 8px;
}

.order-container::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 4px;
}

.order-container::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  border-radius: 4px;
}

.order-item-box {
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  overflow: hidden;
  flex-shrink: 0;
}

.order-item-box:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.main-order {
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border: 2px solid #2ecc71;
  position: relative;
  
}

.main-order::before {
  content: 'Əsas';
  position: absolute;
  top: 0;
  right: 0;
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
  padding: 6px 12px;
  border-radius: 0 0 0 15px;
  font-size: 1em;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(46, 204, 113, 0.2);
  z-index: 9999;
}

.button-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-button {
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  color: #2c3e50;
  font-weight: 600;
  border: none;
  padding: 20px 25px;
  font-size: 1.2em;
  border-radius: 15px;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  touch-action: manipulation;
  min-height: 60px;
}

.order-button:hover {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.order-button span {
  display: flex;
  align-items: center;
  gap: 15px;
}

.order-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2ecc71;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.4em;
  transition: all 0.3s ease;
}

.order-icon.rotated {
  transform: rotate(90deg);
  color: #2ecc71;
}

.order-icon.closed {
  transform: rotate(0deg);
  color: #6c757d;
}

.order-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e9ecef;
  padding: 15px;
}

.table-button {
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  color: #2c3e50;
  border: none;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  margin-left: 10px;
}

.table-button:hover {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.table-button svg {
  font-size: 1.2em;
  color: #2ecc71;
}

@media (max-width: 1024px) {
  .order-items-container {
    border-radius: 15px;
  }


  .order-button {
    padding: 15px 20px;
    font-size: 1.1em;
    min-height: 50px;
  }

  .order-icon {
    width: 28px;
    height: 28px;
    font-size: 1.2em;
  }

  .main-order::before {
    font-size: 0.9em;
    padding: 5px 10px;
  }
}

@media (max-width: 768px) {
  .order-button {
    padding: 15px;
    font-size: 1em;
    min-height: 45px;
  }

  .order-icon {
    width: 24px;
    height: 24px;
    font-size: 1.1em;
  }

  .table-button {
    padding: 8px;
    min-width: 35px;
    height: 35px;
  }
}

@media (max-width: 480px) {
  .order-container{
    padding: 10px;
  }
  .order-item-header{
    padding:15px 10px;
  }
  .order-button {
    padding: 15px 12px;
    font-size: 0.95em;
    min-height: 40px;
  }

  .order-icon {
    width: 20px;
    height: 20px;
    font-size: 1em;
  }

  .table-button {
    padding: 6px;
    min-width: 30px;
    height: 30px;
  }
}
</style>
