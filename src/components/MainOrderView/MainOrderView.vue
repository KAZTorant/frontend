<!-- App.vue -->
<template>
  <div class="main-container">
    <div :class="['header-toggle', { 
        'header-toggle--active': isHeaderVisible,
        'header-toggle--collapsed': !isHeaderVisible 
      }]">
      <transition name="fade-slide">
        <div class="header-container" v-if="isHeaderVisible">
          <div class="header-content" >
            <div class="left-section" >
              <div class="user-info">
                <div class="role-badge">{{ roleDisplayName }}</div>
                <div class="user-name">{{ waitressName }}</div>
              </div>
              <div class="table-info">
                <div class="table-label">Masa</div>
                <div class="table-number">{{ tableName }}</div>
              </div>
              <div class="table-info">
                <div class="table-label">Ümumi məbləğ:</div>
                <div class="table-number">₼ {{ total_price }}</div>
              </div>
            </div>

            <div class="right-section">
              <div class="action-buttons">
                <button class="action-btn tables-btn" @click="goToTablesView()">
                  <font-awesome-icon icon="fa-solid fa-table" />
                  <span>Masalar</span>
                </button>
                <button class="action-btn logout-btn" @click="logout">
                  <font-awesome-icon icon="fa-solid fa-right-from-bracket" />
                  <span>Çıxış</span>
                </button>
              </div>
            </div>
          </div>

          <div class="admin-actions">
            <Actions 
              :table-id="tableId" 
              :selected-order-id="selectedOrderId"
              :role="role"
              @show-confirmation="showConfirmationPopup = true"
              @show-waitress-modal="showWaitressModal = true"
              @show-transfer-modal="showTransferModal = true"
              @show-close-modal="showCloseModal = true"
              @order-confirmed="handleOrderConfirmed"
            />
          </div>
          
        </div>
      </transition>
      
      <button class="toggle-header-btn" @click="isHeaderVisible = !isHeaderVisible">
        <font-awesome-icon :icon="isHeaderVisible ? 'fa-angle-up' : 'fa-angle-down'" />
      </button>
    </div>
    
    
    <div class="content-container">
      <OrderItems class="order-section" :tableId="parseInt(tableId)" @table-click="handleTableClick" />
      <Menu class="menu-section" :tableId="parseInt(tableId)" />
    </div>
    <CustomerCountPopup 
      :show="showCustomerCountPopup"
      @confirm="handleCustomerCountConfirm"
      @close="showCustomerCountPopup = false"
    />
  </div>
</template>

<script>
import OrderItems from './OrderItems.vue';
import Menu from './Menu.vue';
import Actions from './Actions.vue';
import backendServices from '../../backend-services/backend-services';
import store from '../../store';
import router  from '../../router';
import CustomerCountPopup from './CustomerCountPopup.vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTable, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { EventBus } from '../../EventBus';

library.add(faTable, faRightFromBracket);

export default {
  name: 'MainOrderView',
  components: {
    OrderItems,
    Menu,
    Actions,
    CustomerCountPopup
  },
  data() {
    return {
      tableId: null,
      total_price: 0,
      role: null,
      waitressName: "",
      tableName: "",
      print_check: false,
      roleDisplayName: "",
      showCustomerCountPopup: false,
      selectedTableId: null,
      selectedOrderId: null,
      showConfirmationPopup: false,
      showWaitressModal: false,
      showTransferModal: false,
      showCloseModal: false,
      orders: [],
      isHeaderVisible: true,
      orderItemAddedHandler: null,
    }
  },
  async mounted() {
  await this.fetchTableDetailsAndUpdateButtonColor();

  // Store the handler function reference
  this.orderItemAddedHandler = () => {
    this.fetchTableDetailsAndUpdateButtonColor();
  };
  
  // Use the stored reference
  EventBus.on('orderItemAdded', this.orderItemAddedHandler);
},
beforeUnmount() {
  // Add cleanup to prevent memory leaks and duplicate handlers
  if (this.orderItemAddedHandler) {
    EventBus.off('orderItemAdded', this.orderItemAddedHandler);
  }
},

  methods: {
    async fetchTableDetailsAndUpdateButtonColor() {
    try {
      const tableResponse = await backendServices.fetchTableDetails(this.tableId);
      this.total_price = tableResponse.total_price.toFixed(2); 
    } catch (error) {
      console.error('Error fetching table details:', error);
      this.showError('Error fetching table details. Please try again later.');
    }
  },
    logout() {
      this.$store.commit(`auth/SET_AUTHENTICATION`, null);
      this.$store.commit(`auth/SET_ROLE`, null);
      this.$store.commit(`auth/SET_USERNAME`, null); 
      router.push(`/`);
    },
    goToTablesView(){
      router.back();
    },
    async handleTableClick(table) {
      if (table.status === 'empty') {
        this.selectedTableId = table.id;
        this.showCustomerCountPopup = true;
      } else {
        this.tableId = table.id;
        try {
          const tableResponse = await backendServices.fetchTableDetails(table.id);
          this.waitressName = tableResponse.waitress.name;
          this.tableName = tableResponse.number;
          this.print_check = tableResponse.print_check;
        } catch (error) {
          console.error('Error fetching table details:', error);
        }
      }
    },
    async handleCustomerCountConfirm(customerCount) {
      try {
        await backendServices.createOrder(this.selectedTableId, customerCount);
        this.tableId = this.selectedTableId;
        const tableResponse = await backendServices.fetchTableDetails(this.selectedTableId);
        this.waitressName = tableResponse.waitress.name;
        this.tableName = tableResponse.number;
        this.print_check = tableResponse.print_check;
      } catch (error) {
        console.error('Error creating order:', error);
      } finally {
        this.showCustomerCountPopup = false;
        this.selectedTableId = null;
      }
    },
    async fetchOrders() {
      try {
        const response = await backendServices.fetchOrders(this.tableId);
        this.orders = response.orders;
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    },
    async handleOrderConfirmed() {
      try {
        const orders = await backendServices.listOrders(this.tableId);
        this.orders = orders;
        EventBus.emit('orderItemAdded');
      } catch (error) {
        console.error('Error handling order confirmation:', error);
      }
    }
  },
  
  async created() {
    this.tableId = this.$route.params.id;
    this.role = store.getters['auth/GET_ROLE'];

    if(this.role === "admin"){
      this.roleDisplayName = "Adminstrator";
    }else if(this.role === "waitress"){
      this.roleDisplayName = "Ofsiant";
    }else if(this.role === "restaurant"){
      this.roleDisplayName = "Admin";
    }

    try {
      const tableResponse = await backendServices.fetchTableDetails(this.tableId);
      this.waitressName = tableResponse.waitress.name;
      this.tableName = tableResponse.number;
      this.print_check = tableResponse.print_check;
    } catch (error) {
      console.error('Error fetching waitress details:', error);
    }
  }
}
</script>

<style>
/* Keep all existing styles except modal-related ones */
.main-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 245, 245, 0.98));
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  overflow: hidden;
  position: relative;
}

.header-toggle {
  position: relative;
}

.header-toggle--collapsed {
  padding: 13px 0;
}

.header-toggle--collapsed .toggle-header-btn{
  border-radius: 0 0 0 50%;
}

.toggle-header-btn {
  position: absolute;
  bottom: -19px;
  right: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50% 0 0 50%;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  font-size: 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  z-index: 20;
}

.toggle-header-btn:hover {
  background-color: linear-gradient(135deg, #2980b9, #1c6ea4);
}
.header-container {
  background-color: linear-gradient(135deg, #ffffff, #f8f9fa);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid #e9ecef;
  padding: 20px;
  position: relative;
  z-index: 10;
  overflow: hidden;
}

/* Header container animation */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
  overflow: hidden;
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 500px;
}

/* Header content */
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.left-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.role-badge {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
  padding: 8px 16px;
  border-radius: 25px;
  font-size: 1.1em;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(46, 204, 113, 0.2);
}

.user-name {
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.3em;
}

.table-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.table-label {
  color: #6c757d;
  font-size: 1.1em;
}

.table-number {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
  font-size: 1.8em;
}

.action-buttons {
  display: flex;
  gap: 15px;
}

.admin-actions {
  display: flex;
  gap: 12px;
  flex-wrap: nowrap;
  justify-content: flex-start;
  margin-top: 15px;
  width: 100%;
}

.admin-actions > * {
  flex: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1em;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  min-width: 180px;
  justify-content: center;
}

.tables-btn {
  background: linear-gradient(135deg, #ffa502, #ff7f00);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 165, 2, 0.2);
}

.tables-btn:hover {
  background: linear-gradient(135deg, #ff7f00, #ff6b00);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 165, 2, 0.3);
}

.logout-btn {
  background: linear-gradient(135deg, #ff6b6b, #ff5252);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 82, 82, 0.2);
}

.logout-btn:hover {
  background: linear-gradient(135deg, #ff5252, #ff1744);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 82, 82, 0.3);
}

.content-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  padding: 25px;
  flex: 1;
  height: calc(100vh - 220px);
  overflow: hidden;
}

.order-section, .menu-section {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 245, 245, 0.98));
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .left-section {
    flex-direction: row;
    align-items: center;
    gap: 20px;
    width: 100%;
  }

  .right-section {
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .admin-actions {
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }

  .admin-actions > * {
    flex: 0 1 auto;
  }

  .action-buttons {
    justify-content: center;
    flex-wrap: wrap;
  }

  .content-container {
    grid-template-columns: 1fr;
    height: calc(100vh - 280px);
    gap: 15px;
    padding: 15px;
    overflow-y: auto;
  }

  .order-section, .menu-section {
    min-height: 300px;
    max-height: 400px;
    height: auto;
  }

  .action-btn {
    min-width: 160px;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 10px;
  }

  .admin-actions {
    gap: 8px;
  }

  .action-btn {
    padding: 10px 15px;
    font-size: 0.95em;
    min-width: 140px;
  }

  .content-container {
    padding: 10px;
    gap: 10px;
    height: calc(100vh - 260px);
  }
}

@media (max-width: 480px) {
  .header-container { 
    padding: 6px;
  }

  .user-info {
    gap: 4px;
  }

  .table-info {
    gap: 4px;
  }

  .header-content {
    gap: 10px;
  }

  .left-section {
    flex-direction: row;
    gap: 10px;
  }


  .content-container {
    padding: 8px;
    gap: 8px;
    height: calc(100vh - 240px);
  }
}

/* Add support for landscape mode */
@media (max-width: 900px) and (orientation: landscape) {
  .content-container {
    grid-template-columns: 1fr;
    height: calc(100vh - 200px);
  }

  .header-content {
    flex-direction: row;
    align-items: center;
  }

  .left-section {
    flex-direction: row;
  }

  .right-section {
    flex-direction: row;
  }

  .admin-actions {
    flex-wrap: nowrap;
    justify-content: flex-start;
  }

  .admin-actions > * {
    flex: 1;
  }
}
</style>