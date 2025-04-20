<template>
  <div class="order-dropdown" v-if="showDropdown">
    <div class="selected-controls" v-if="selectedItem">
      <div class="quantity-container">
        <button
          v-if="checkViewPermissionForAdmin() && selectedItem.confirmed"
          @click="openTransferPopup(selectedItem)"
          class="btn-transfer"
        >
          <font-awesome-icon icon="arrow-right-arrow-left" />
        </button>
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
        <span>{{ item.meal.price.toFixed(2) }} azn</span>
        <span>{{ (item.quantity * item.meal.price).toFixed(2) }} azn</span>
        <span
          class="status-indicator"
          :class="item.confirmed ? 'confirmed' : 'waiting'"
        >
          <font-awesome-icon :icon="item.confirmed ? 'check' : 'hourglass-half'" />
        </span>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="showTransferItemsModal" class="modal-container">
      <div class="modal-overlay" @click="cancelTransfer"></div>
      <div class="confirmation-dialog">
        <h2 class="modal-title">Məhsul köçür</h2>
        <div class="modal-content-main hall">
          <div v-if="selectedItem">
            <div for="quantity">{{ selectedItem.meal.name }}</div>
            <div class="quantity-selector">
              <button
                @click="decreaseQuantity"
                :disabled="transferQuantity <= 1"
                class="btn-decrement"
              ><font-awesome-icon icon="minus" /></button>
              <div class="quantity-input">{{ transferQuantity }}</div>
              <button
                @click="increaseQuantity"
                :disabled="transferQuantity >= maxQuantity"
                class="btn-increment"
              ><font-awesome-icon icon="plus" /></button>
            </div>
            <span>Cəm: {{ transferQuantity * selectedItem.meal.price.toFixed(2) }} azn</span>
          </div>

          <div>
            <label for="hall">Zal Seç:</label>
            <select id="hall" v-model="selectedHall" @change="fetchTablesForHall">
              <option v-for="hall in halls" :key="hall.id" :value="hall.id">{{ hall.name }}</option>
            </select>
          </div>
          <div>
            <label for="table">Masa seç:</label>
            <select id="table" v-model="selectedTable">
              <option
              v-for="table in tables.filter(t => t.id !== this.tableId)"
              :key="table.id"
                :value="table.id"
              >
                {{ table.number }}{{ table.waitress.id !== 0 ? ' (Dolu)' : '' }}
              </option>
            </select>
          </div>
        </div>
        <div class="confirmation-buttons">
          <button class="confirm-btn" @click="confirmTransfer">Təsdiqlə</button>
          <button class="cancel-btn" @click="cancelTransfer">Ləğv et</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import backendServices from '@/backend-services/backend-services';

export default {
  props: {
    showDropdown: { type: Boolean, required: true },
    orderItems: { type: Array, required: true },
    orderId: { type: Number, required: true },
    tableId: {
    type: Number,
    required: true
  },
    totalPrice: { type: Number, required: true },
    checkViewPermissionForAdmin: { type: Function, required: true },
    incrementQuantity: { type: Function, required: true },
    decrementQuantity: { type: Function, required: true },
  },
  data() {
    return {
      selectedItem: null,
      transferQuantity: 1,
      showTransferItemsModal: false,
      selectedHall: null,
      selectedTable: null,
      halls: [],
      tables: [],
      maxQuantity: 0,
      localOrderItems: [],
      localTotalPrice: 0,
    };
  },
  created() {
  this.localOrderItems = this.orderItems;
  this.localTotalPrice = this.totalPrice;
},
  methods: {
    async fetchOrderItems() {
    try {
      const response = await backendServices.listOrderItems(this.tableId);
      this.localOrderItems = response.items;
      this.localTotalPrice = response.total_price;
    } catch (error) {
      console.error('Məhsullar gətirilə bilmədi:', error);
    }
  },
    selectItem(item) {
      this.selectedItem = item;
    },
    openTransferPopup(item) {
      this.selectedItem = item;
      this.transferQuantity = 1;
      this.maxQuantity = item.quantity;
      this.showTransferItemsModal = true;
      this.fetchHalls();
    },
    cancelTransfer() {
      this.showTransferItemsModal = false;
      this.selectedHall = null;
      this.selectedTable = null;
    },
    async confirmTransfer() {
      if (!this.selectedTable) {
        return this.showError("Zəhmət olmasa masa seçin.");
      }
      if (this.transferQuantity < 1 || this.transferQuantity > this.maxQuantity) {
        return this.showError(`1-dən ${this.maxQuantity}-ə qədər məhsul köçürə bilərsiniz.`);
      }
      try {
        const order_id = this.orderId || this.selectedItem.order_id || this.selectedItem.id;
        const payload = {
          order_id,
          meal_id: this.selectedItem.meal.id,
          quantity: this.transferQuantity,
          target_table_id: this.selectedTable,
        };
        const result = await backendServices.transferOrderItems(payload, this.tableId);
        // Optionally update UI based on result
        this.$emit('transfer-success', result);
        await this.fetchOrderItems();
        this.cancelTransfer();
      } catch (error) {
        console.error('Transfer failed:', error);
        this.showError('Köçürmə uğursuz oldu. Yenidən cəhd edin.');
      }
    },
    decreaseQuantity() {
      if (this.transferQuantity > 1) {
        this.transferQuantity -= 1;
      }
    },
    increaseQuantity() {
      if (this.transferQuantity < this.maxQuantity) {
        this.transferQuantity += 1;
      }
    },
    async fetchHalls() {
      try {
        this.halls = await backendServices.fetchRooms();
        if (this.halls.length > 0) {
          this.selectedHall = this.halls[0].id;
          await this.fetchTablesForHall();
        }
      } catch (error) {
        console.error('Error fetching halls:', error);
        this.showError('Zalları yükləmək mümkün olmadı. Zəhmət olmasa sonra cəhd edin.');
      }
    },
    async fetchTablesForHall() {
      if (!this.selectedHall) return;
      try {
        const tables = await backendServices.fetchTablesByHallId(this.selectedHall);
        this.tables = tables;
        this.selectedTable = this.tables.length ? this.tables[0].id : null;
      } catch (error) {
        console.error('Error fetching tables:', error);
        this.showError('Masaları yükləmək mümkün olmadı. Zəhmət olmasa sonra cəhd edin.');
      }
    },
    showError(msg) {
      alert(msg);
    }
  },
};
</script>


<style scoped>
.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999999;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
}

.confirmation-dialog {
  position: relative;
  background: #ffffff;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
  border: 2px solid #2ecc71;
  text-align: center;
  min-width: 400px;
  z-index: 99999999;
}
.confirmation-message {
  max-width: 380px;
  width: 100%;
  margin: 0 auto 20px;
  display: flex;
  flex-wrap: wrap ;
  justify-content: center;
  gap: 10px;
}

.confirmation-message > div {
  display: flex;
  flex-direction: column;

}

.confirmation-message label {
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
  font-size: 14px;
}

.confirmation-message .input {
  max-width: 120px;
  width: 100%;
  padding: 10px;
  border: 1px solid #2ecc71;
  border-radius: 6px;
  font-size: 16px;
  background-color: #f9f9f9;
  text-align: center;
  color: #222;
}

.confirmation-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.confirm-btn,
.cancel-btn {
  padding: 12px 30px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1em;
  min-width: 120px;
}

.confirm-btn {
  background: #4caf50;
  color: white;
  border: none;
}

.confirm-btn:hover {
  background: #43a047;
}

.cancel-btn {
  background: #f44336;
  color: white;
  border: none;
}

.cancel-btn:hover {
  background: #e53935;
}

.modal-title {
  font-size: 1.5em;
  color: #2c3e50;
  margin-bottom: 20px;
}

.modal-content-main {
  margin: 20px 0;
}

.modal-content-main label {
  display: block;
  margin-bottom: 10px;
  color: #2c3e50;
}

.modal-content-main select {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  margin-bottom: 15px;
}

.order-dropdown {
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  margin: 10px 15px 15px;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid #2ecc71;
  overflow: hidden;
  position: relative;
}

.quantity-selector{
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  margin-top: 10px;
}
.quantity-container {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 10px;
}

.order-item button,
.quantity-container button,
.quantity-selector button {
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

.quantity,
.quantity-input {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.1em;
  font-weight: 600;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  text-align: center;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.quantity{
  min-width: 32px;
  height: 32px;
  margin: 0 auto;
}
.quantity-input{
  width: 40px;
  height: 40px;  
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

.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999999;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
}

.confirmation-dialog {
  position: relative;
  background: #ffffff;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
  border: 2px solid #2ecc71;
  text-align: center;
  min-width: 400px;
  z-index: 99999999;
}

.btn-transfer {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}
.btn-transfer:hover {
  background: linear-gradient(135deg, #2980b9, #2471a3);
}
@media (max-width: 500px) {
  .order-items-header,
  .order-item {
    grid-template-columns: repeat(5, minmax(50px, 1fr));
  }
}
</style>
