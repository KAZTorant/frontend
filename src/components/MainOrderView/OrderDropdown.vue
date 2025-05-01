<template>
  <div class="order-dropdown" v-if="showDropdown">
    <div class="selected-controls" v-if="selectedItem && selectedItem.quantity > 0">
      <div class="quantity-container">
        <button
          v-if="!selectedItem.confirmed"
          @click="openCustomizationModal(selectedItem)"
          class="btn-customize"
        >
        <font-awesome-icon icon="comment-medical" />
        </button>
        <!-- Transfer button for confirmed items -->
        <button
          v-if="checkViewPermissionForAdmin() && selectedItem.confirmed"
          @click="openTransferModal(selectedItem)"
          class="btn-transfer"
        >
          <font-awesome-icon icon="arrow-right-arrow-left" />
        </button>
        <!-- Decrement button: opens return modal for confirmed, otherwise decrements directly -->
        <button
          v-if="checkViewPermissionForAdmin()"
          @click="selectedItem.confirmed ? openReturnModal(selectedItem) : decrementQuantity(selectedItem)"
          class="btn-decrement"
        >
          <font-awesome-icon icon="minus" />
        </button>
        <!-- Increment button remains unchanged -->
        <button
          v-if="selectedItem.order_item_id === 0"
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
        :key="`${item.order_item_id}_${item.meal.id}`"
        @click="selectItem(item)"
        :class="{ active: selectedItem && `${selectedItem.order_item_id}_${selectedItem.meal.id}` === `${item.order_item_id}_${item.meal.id}`}"
      >
        <span class="meal-name-with-comment">
          <button
            v-if="item.comment"
            @click="openModal(item.comment)"
            class="btn-comment"
          >
            <font-awesome-icon icon="comment-dots" />
          </button>
          <button
            v-if="item.transfer_comment"
            @click="openModal(item.transfer_comment)"
            class="btn-transfer-comment"
          >
            <font-awesome-icon icon="comment-dots" />
          </button>
          <span>{{ item.meal.name }}</span>
        </span>


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

  <!-- Commit Modal -->
  <Teleport to="body">
  <div v-if="showModal" class="modal-container">
    <div class="modal-overlay" @click="closeModal"></div>
    <div class="confirmation-dialog">
      <h2 class="modal-title">Şərh</h2>
      <div class="modal-content-main hall">
        <div v-if="selectedItem">
          <div class="item-name">{{ selectedItem.meal.name }}</div>
          <div class="quantity-selector">
            <div class="quantity-input">{{ selectedItem.quantity }}</div>
          </div>
        </div>

        <div class="description">
          <label for="custom-note" class="section-title">
            Müştərinin Əlavə İstəkləri:
          </label>
          <textarea
            id="custom-note"
            v-model="selectedComment"
            class="message-textarea"
            :disabled="isDisabled"
          ></textarea>
        </div>
      </div>

      <div class="confirmation-buttons">
        <button class="cancel-btn" @click="closeModal">Bağla</button>
      </div>
    </div>
  </div>
</Teleport>

<!-- Customize Modal -->
<Teleport to="body">
  <div v-if="showCustomizationModal" class="modal-container">
    <div class="modal-overlay" @click="cancelCustomization"></div>
    <div class="confirmation-dialog">
      <h2 class="modal-title">Xüsusi Qeyd</h2>

      <div class="modal-content-main hall">
        <div v-if="selectedItem && !selectedItem.confirmed">
          <div class="item-name">{{ selectedItem.meal.name }}</div>

          <div class="quantity-selector">
            <div class="quantity-input">{{ customQuantity }}</div>
          </div>
          <div class="description">
            <label for="custom-note" class="section-title">
            Müştərinin Əlavə İstəkləri:
          </label>
            <textarea
              v-model="customDescription"
              class="message-textarea"
              placeholder='Məsələn: "2 porsiya soğansız", "2 porsiya soğanlı"...'
              @click="showVirtualKeyboard($event)"
            ></textarea>
          </div>
          
        </div>
      </div>
      <div class="confirmation-buttons">
        <button class="confirm-btn" @click="confirmCustomization">Təsdiqlə</button>
        <button class="cancel-btn" @click="cancelCustomization">Ləğv et</button>
      </div>
    </div>
  </div>
</Teleport>


  <!-- Transfer Modal -->
  <Teleport to="body">
    <div v-if="showTransferItemsModal" class="modal-container">
      <div class="modal-overlay" @click="cancelTransfer"></div>
      <div class="confirmation-dialog">
        <h2 class="modal-title">Məhsul köçür</h2>
        <div class="modal-content-main hall">
          <div v-if="selectedItem">
            <div>{{ selectedItem.meal.name }}</div>
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
            <div class="total-price">
              Cəm: <strong>{{ (transferQuantity * selectedItem.meal.price).toFixed(2) }} AZN</strong>
            </div>
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
                v-for="table in tables.filter(t => t.id !== tableId)"
                :key="table.id"
                :value="table.id"
              >
                {{ table.number }}{{ table.waitress.id !== 0 ? ' (Dolu)' : '' }}
              </option>
            </select>
          </div>
          <textarea
              v-model="transferComment"
              class="message-textarea"
              placeholder='Məsələn: Transfer haqqinda comment yazin'
              @click="showVirtualKeyboard($event)"
            ></textarea>
        </div>
        <div class="confirmation-buttons">
          <button class="confirm-btn" @click="confirmTransfer">Təsdiqlə</button>
          <button class="cancel-btn" @click="cancelTransfer">Ləğv et</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Return/Defective Modal -->
  <Teleport to="body">
  <div v-if="showReturnItemsModal" class="modal-container">
    <div class="modal-overlay" @click="cancelReturn"></div>
    <div class="confirmation-dialog">
      <h2 class="modal-title">Məhsulu geri qaytar</h2>
      <div class="modal-content-main hall">
        <div v-if="selectedItem" class="selected-item">
          <div class="item-name">{{ selectedItem.meal.name }}</div>

          <div class="quantity-selector">
            <div class="quantity-input">{{ returnQuantity }}</div>
          </div>

          <div class="total-price">
            Cəm: <strong>{{ (returnQuantity * selectedItem.meal.price).toFixed(2) }} AZN</strong>
          </div>
        </div>

        <div class="action-type">
          <label for="reasonSelect" class="section-title">Silinmə səbəbini seçin:</label>
          <select
            v-model="selectedReturnAction"
            id="reasonSelect"
            class="reason-select"
          >
            <option value="return">Anbara qaytar</option>
            <option value="waste">Yararsız məhsul</option>
          </select>
        </div>

        <div class="message-field">
          <label for="returnMessage" class="section-title">Səbəbini yazın:</label>
          <textarea
            id="returnMessage"
            v-model="returnMessage"
            class="message-textarea"
            placeholder="Mesajınızı daxil edin..."
            @click="showVirtualKeyboard($event)"
          ></textarea>
        </div>
      </div>

      <div class="confirmation-buttons">
        <button class="confirm-btn" @click="confirmReturn">Təsdiqlə</button>
        <button class="cancel-btn" @click="cancelReturn">Ləğv et</button>
      </div>
    </div>
  </div>
</Teleport>

<!-- Virtual Keyboard Component -->
 <Teleport to="body">
  <div class="keyboard-container">
    <VirtualKeyboard 
    :isVisible="showKeyboard" 
    :targetElement="activeTextarea"
    @hide-keyboard="hideVirtualKeyboard"
  />
  </div>
 </Teleport>


</template>

<script>
import backendServices from '@/backend-services/backend-services';
import { EventBus } from '@/EventBus';
import VirtualKeyboard from '@/components/VirtualKeyboard.vue';

export default {
  components: {
    VirtualKeyboard
  },
  props: {
    showDropdown: { type: Boolean, required: true },
    orderItems: { type: Array, required: true },
    orderId: { type: Number, required: true },
    tableId: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    checkViewPermissionForAdmin: { type: Function, required: true },
    incrementQuantity: { type: Function, required: true },
    decrementQuantity: { type: Function, required: true },
  },
  data() {
    return {
      selectedItem: null,
      transferQuantity: 1,
      customQuantity: 1,
      showTransferItemsModal: false,
      selectedHall: null,
      selectedTable: null,
      halls: [],
      tables: [],
      maxQuantity: 0,
      showReturnItemsModal: false,
      returnQuantity: 1,
      maxReturnQuantity: 0,
      selectedReturnAction: 'return',
      returnMessage: '',
      localOrderItems: [],
      localTotalPrice: 0,
      localComment: '',
      showCustomizationModal: false,
      customDescription: '',
      showModal: false,
      selectedComment: '',
      isDisabled: true,
      transferComment: '',
      
      // Virtual keyboard related data
      showKeyboard: false,
      activeTextarea: null
    };
  },
  created() {
    this.localOrderItems = this.orderItems;
    this.localTotalPrice = this.totalPrice;
    this.localComment = this.comment;
  },
  methods: {
    // Virtual keyboard methods
    showVirtualKeyboard(event) {
      // Set the active textarea to the one that was clicked
      this.activeTextarea = event.target;
      this.showKeyboard = true;
    },
    
    hideVirtualKeyboard() {
      this.showKeyboard = false;
      this.activeTextarea = null;
    },
    
    async fetchOrderItems() {
      try {
        const response = await backendServices.listOrderItems(this.tableId);
        this.localOrderItems = response.items;
        this.localTotalPrice = response.total_price;
        this.localComment = response.comment;
      } catch (error) {
        console.error('Məhsullar gətirilə bilmədi:', error);
      }
    },
    selectItem(item) {
      this.selectedItem = item;
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

    // Comment Modal
    openModal(comment, item) {
      this.selectedComment = comment;
      this.showModal = true;
      this.maxQuantity = item.maxQuantity || item.quantity || 1;
    },
    closeModal() {
      this.showModal = false;
      this.selectedComment = '';
    },

    // Transfer Modal
    openTransferModal(item) {
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
        const	payload = {
          order_id,
          meal_id: this.selectedItem.meal.id,
          quantity: this.transferQuantity,
          target_table_id: this.selectedTable,
          transfer_comment: this.transferComment,
          order_item_id: this.selectedItem.order_item_id,
        };
        const result = await backendServices.transferOrderItems(payload, this.tableId);
        this.$emit('transfer-success', result);
        await this.fetchOrderItems();
        this.cancelTransfer();
        console.log(this.localOrderItems)
        if(this.localOrderItems === undefined || this.localOrderItems.length === 0){
          window.location.reload();
        }
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

    // Return Modal
    openReturnModal(item) {
      this.selectedItem = item;
      this.returnQuantity = 1;
      this.maxReturnQuantity = item.quantity;
      this.selectedReturnAction = 'return';
      this.returnMessage = '';
      this.showReturnItemsModal = true;
    },
    cancelReturn() {
      this.showReturnItemsModal = false;
    },
    async confirmReturn() {
      if (!this.selectedReturnAction) {
        return this.showError('Zəhmət olmasa anbara qaytar və ya yararsız məhsul olaraq seçin.');
      }
      try {
        const payload = {
          order_id: this.orderId,
          meal_id: this.selectedItem.meal.id,
          quantity: this.returnQuantity,
          reason: this.selectedReturnAction,
          reason_comment: this.returnMessage,
          confirmed: true,
          order_item_id: this.selectedItem.order_item_id,
        };
        const result = await backendServices.deleteOrderItem(this.tableId, payload);
        this.$emit('return-success', result);
        await this.fetchOrderItems();
        EventBus.emit('orderItemAdded', () => {
          this.fetchOrderItems;
        });
        this.cancelReturn();
        if(this.localOrderItems === undefined || this.localOrderItems.length === 0){
          window.location.reload();
        }
      } catch (error) {
        console.error('Return failed:', error);
        this.showError('Əməliyyat uğursuz oldu. Yenidən cəhd edin.');
      }
    },

  // Customize Modal
    openCustomizationModal(item) {
    this.selectedItem = item;
    this.customDescription = item.comment || '';
    this.showCustomizationModal = true;
    this.customQuantity = item.quantity;
  },

  async confirmCustomization() {
    if (!this.selectedItem) return;

    try {
      await backendServices.commentOrderItem(
        this.tableId,
        this.selectedItem.meal.id,
        this.customDescription,
        this.orderId
      );

      this.selectedItem.customDescription = this.customDescription;

      this.$emit('customization-success', this.selectedItem);
      await this.fetchOrderItems(this.selectedItem.orderId);
      EventBus.emit('orderItemAdded', () => {
          this.fetchOrderItems;
        });
      this.showCustomizationModal = false;
    } catch (error) {
      console.error('Error saving customization:', error);
      this.showError('Xüsusi qeydi yadda saxlamaq alınmadı. Yenidən cəhd edin.');
    }
  },

  cancelCustomization() {
    this.showCustomizationModal = false;
  },

    showError(msg) {
      alert(msg);
    },
  },
};
</script>


<style scoped>
.keyboard-container {
  position: fixed;
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 9999999;
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
  top:0;
  transform: translateY(-15%);
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
.meal-name-with-comment{
  display: flex;
  justify-content: flex-start !important;
  position: relative;
}
.meal-name-with-comment .btn-comment{
  position: absolute;
  top: -15px;
  right: -15px;
  width: 30px !important;
  background: none !important;
  box-shadow: none;
  color: #f8a023;
}
.meal-name-with-comment span{
 margin: 0 auto;
}

.meal-name-with-comment .btn-transfer-comment{
  position: absolute;
  top: -15px;
  right: -15px;
  width: 30px !important;
  background: none !important;
  box-shadow: none;
  color: #2a97db;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn,
.ok-btn {
  background-color: #4f46e5;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;
}

.close-btn {
  background-color: #ef4444;
}


.total-price{
  margin-top: 5px;
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
.action-type {
  margin-top: 20px;
}

.section-title {
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
  color: #333;
  font-size: 15px;
}

.message-field {
  margin-top: 0px;
}

.message-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #444;
}

.description{
  padding-top: 10px;
}

.message-textarea {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #4caf50;
  resize: vertical;
  font-size: 14px;
  font-family: inherit;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: border-color 0.3s, box-shadow 0.3s;
}
.message-textarea:disabled {
  background-color: #f0f0f0;       
  color: #444;
  cursor: not-allowed;
}

.message-textarea:focus {
  border-color: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
  outline: none;
}

.order-dropdown {
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
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

.btn-customize {
  background-color: #f8a023;
  color: white;
}

.btn-transfer {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.btn-transfer:hover {
  background: linear-gradient(135deg, #2980b9, #2471a3);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(41, 128, 185, 0.3);
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

.btn-customize:hover {
  background-color: #e6891b;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(248, 160, 35, 0.3);
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
  display: flex;
  justify-content: flex-end;
  align-items: center;
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

.item-comment {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.85em;
  color: #555;
}
.comment-icon {
  margin-right: 6px;
  color: #2471a3;
}
.comment-text {
  padding: 4px 8px;
  border-radius: 4px;
}

@media (max-width: 500px) {
  .order-items-header,
  .order-item {
    padding: 0 5px;
    grid-template-columns: 90px repeat(4, minmax(50px, 1fr));
  }
}
</style>
