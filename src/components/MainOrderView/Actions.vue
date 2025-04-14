<template>
  <div class="actions-container">
    <div class="admin-actions">
      <button
        v-for="action in actions"
        :key="action.id"
        class="action-button"
        :data-id="action.id"
        @click="handleAction(action.method)"
      >
        {{ action.label }}
      </button>
    </div>
    <ErrorPopup v-if="error" :message="error" @close="clearError" />
    <SuccessPopup v-if="successMessage" :message="successMessage" @close="clearSuccess" />
  </div>
</template>

<script>
import ErrorPopup from '@/components/ErrorPopup.vue';
import SuccessPopup from '@/components/SuccessPopup.vue';
import backendServices from '@/backend-services/backend-services';
import router from '@/router/';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPrint, faUser, faExchangeAlt, faTimes, faUtensils } from '@fortawesome/free-solid-svg-icons';

library.add(faPrint, faUser, faExchangeAlt, faTimes, faUtensils);

export default {
  components: {
    ErrorPopup,
    SuccessPopup
  },
  name: 'Actions',
  props: {
    tableId: {
      type: [Number, String],
      required: true,
      validator: (value) => {
        return !isNaN(Number(value));
      }
    },
    selectedOrderId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      actions: [
        { id: 1, label: 'Print Çek', method: 'printOrder' },
        { id: 2, label: 'Ofsianti dəyiş', method: 'changeWaitress' },
        { id: 3, label: 'Masanı bağla', method: 'cancelOrder' },
        { id: 4, label: 'Masanı köçür', method: 'openTransferModal' },
        { id: 5, label: 'Çeki ləğv et', method: 'cancelPrintOrder' },
        { id: 6, label: 'Masanı birləşdir', method: 'openCombine' },
        { id: 7, label: 'Mətbəxə göndər', method: 'confirmKitchen', isKitchenButton: true }
      ],
      error: null,
      successMessage: null,
      buttonColor: '',
      showConfirmation: false,
      showTransferModal: false,
      showWaitressModal: false,
      showCombineModal: false,
      selectedHall: null,
      selectedTable: null,
      selectedWaitress: null,
      halls: [],
      tables: [],
      waitresses: []
    };
  },
  async mounted() {
    await this.fetchTableDetailsAndUpdateButtonColor();
    await this.fetchHalls();
    await this.fetchTablesForHall();
    await this.fetchTablesForCombine();
    await this.fetchWaitresses();
  },
  methods: {
    async fetchTableDetailsAndUpdateButtonColor() {
      try {
        const tableResponse = await backendServices.fetchTableDetails(this.tableId);
        this.buttonColor = tableResponse.print_check ? '#74E291' : '';
      } catch (error) {
        console.error('Error fetching table details:', error);
        this.showError('Error fetching table details. Please try again later.');
      }
    },

    async fetchHalls() {
      try {
        const hallsResponse = await backendServices.fetchHalls();
        this.halls = hallsResponse.halls;
      } catch (error) {
        console.error('Error fetching halls:', error);
        this.showError('Error fetching halls. Please try again later.');
      }
    },

    async fetchTablesForHall() {
      try {
        const tablesResponse = await backendServices.fetchTablesForHall();
        this.tables = tablesResponse.tables;
      } catch (error) {
        console.error('Error fetching tables for hall:', error);
        this.showError('Error fetching tables for hall. Please try again later.');
      }
    },

    async fetchTablesForCombine() {
      try {
        const tablesResponse = await backendServices.fetchTablesForCombine();
        this.tables = tablesResponse.tables;
      } catch (error) {
        console.error('Error fetching tables for combine:', error);
        this.showError('Error fetching tables for combine. Please try again later.');
      }
    },

    async fetchWaitresses() {
      try {
        const waitressesResponse = await backendServices.fetchWaitresses();
        this.waitresses = waitressesResponse.waitresses;
      } catch (error) {
        console.error('Error fetching waitresses:', error);
        this.showError('Error fetching waitresses. Please try again later.');
      }
    },

    async handleAction(methodName) {
      switch(methodName) {
        case 'openTransferModal':
          this.showTransferDialog();
          break;
        case 'cancelOrder':
          this.showConfirmationDialog();
          break;
        case 'changeWaitress':
          this.showWaitressDialog();
          break;
        case 'openCombine':
          this.showCombineDialog();
          break;
        case 'printOrder':
          await this.callPrintOrder(this.tableId);
          break;
        case 'cancelPrintOrder':
          await this.callCanelPrintOrder(this.tableId);
          break;
        case 'confirmKitchen':
          try {
            await backendServices.confirmOrder(this.tableId);
            this.showSuccess('Sifariş mətbəxə göndərildi.');
            this.$emit('order-confirmed');
          } catch (error) {
            console.error('Error confirming order:', error);
            if (error.code === 'ECONNABORTED') {
              this.showError('Server cavab vermir. Zəhmət olmasa bir az sonra yenidən cəhd edin.');
            } else {
              this.showError('Sifarişi mətbəxə göndərmək mümkün olmadı.');
            }
          }
          break;
      }
    },

    async callPrintOrder(tableId) {
      try {
        await backendServices.printCheck(tableId);
        this.showSuccess('Çek print olundu.');
        await this.fetchTableDetailsAndUpdateButtonColor();
      } catch (error) {
        console.error('Error printing check:', error);
        this.showError('Çek print olunub artıq.');
      }
    },

    async callCanelPrintOrder(tableId) {
      try {
        await backendServices.deleteCheck(tableId);
        this.showSuccess('Çek leğv olundu.');
        await this.fetchTableDetailsAndUpdateButtonColor();
      } catch (error) {
        console.error('Error cancelling check:', error);
        this.showError('Çeki ləğv etmədə problem yarandı.');
      }
    },

    showError(errorMessage) {
      this.error = errorMessage;
    },

    clearError() {
      this.error = null;
    },

    showSuccess(successMessage) {
      this.successMessage = successMessage;
    },

    clearSuccess() {
      this.successMessage = null;
    },

    // Modal show methods
    showConfirmationDialog() {
      this.showConfirmation = true;
    },

    showTransferDialog() {
      this.showTransferModal = true;
      this.fetchHalls();
    },

    showWaitressDialog() {
      this.showWaitressModal = true;
      this.fetchWaitresses();
    },

    showCombineDialog() {
      this.showCombineModal = true;
      this.fetchHalls();
    },

    // Modal cancel methods
    cancelAction() {
      this.showConfirmation = false;
    },

    cancelTransfer() {
      this.showTransferModal = false;
    },

    cancelWaitressChange() {
      this.showWaitressModal = false;
    },

    cancelCombine() {
      this.showCombineModal = false;
    },

    // Modal confirm methods
    async confirmAction() {
      try {
        await backendServices.closeTableForOrder(this.tableId);
        router.back();
      } catch (error) {
        console.error('Error closing table:', error);
        this.showError('Error closing table. Please try again later.');
      }
      this.showConfirmation = false;
    },

    async confirmTransfer() {
      if (this.selectedHall && this.selectedTable) {
        try {
          await backendServices.changeTableForOrder(this.tableId, this.selectedTable);
          this.showTransferModal = false;
          router.back();
        } catch (error) {
          console.error('Error changing table:', error);
          this.showError('Error changing table. Please try again later.');
        }
      }
    },

    async confirmWaitressChange() {
      if (this.selectedWaitress) {
        try {
          await backendServices.changeWaitressForOrder(this.tableId, this.selectedWaitress);
          this.showWaitressModal = false;
          router.back();
        } catch (error) {
          console.error('Error changing waitress:', error);
          this.showError('Error changing waitress. Please try again later.');
        }
      }
    },

    async confirmCombine() {
      if (this.selectedTable) {
        try {
          await backendServices.combineTables(this.tableId, [this.selectedTable]);
          this.showCombineModal = false;
          router.back();
        } catch (error) {
          console.error('Error combining tables:', error);
          this.showError('Error combining tables. Please try again later.');
        }
      }
    },

    // Data fetching methods
    async fetchHalls() {
      try {
        this.halls = await backendServices.fetchRooms();
        if (this.halls.length > 0) {
          this.selectedHall = this.halls[0].id;
          await this.fetchTablesForHall();
        }
      } catch (error) {
        console.error('Error fetching halls:', error);
        this.showError('Error fetching halls. Please try again later.');
      }
    },

    async fetchTablesForHall() {
      if (!this.selectedHall) return;
      try {
        const tables = await backendServices.fetchTablesByHallId(this.selectedHall);
        this.tables = tables.filter(table => table.waitress.id === 0);
        if (this.tables.length > 0) {
          this.selectedTable = this.tables[0].id;
        }
      } catch (error) {
        console.error('Error fetching tables:', error);
        this.showError('Error fetching tables. Please try again later.');
      }
    },

    async fetchTablesForCombine() {
      if (!this.selectedHall) return;
      try {
        const tables = await backendServices.fetchTablesByHallId(this.selectedHall);
        this.tables = tables.filter(table => table.waitress.id !== 0 && table.id !== this.tableId);
        if (this.tables.length > 0) {
          this.selectedTable = this.tables[0].id;
        }
      } catch (error) {
        console.error('Error fetching tables:', error);
        this.showError('Error fetching tables. Please try again later.');
      }
    },

    async fetchWaitresses() {
      try {
        this.waitresses = await backendServices.fetchWaitresses();
        if (this.waitresses.length > 0) {
          this.selectedWaitress = this.waitresses[0].id;
        }
      } catch (error) {
        console.error('Error fetching waitresses:', error);
        this.showError('Error fetching waitresses. Please try again later.');
      }
    }
  }
};
</script>

<style scoped>
.green-button {
  background-color: #74E291 !important;
}
.actions {
  width: 640px;
  display: flex;
  gap: 5px;
  padding: 0 10px;
  white-space: nowrap;
  overflow-x: auto;
}

.actions-container {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.admin-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-button {
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 130px;
  height: 58px;
  margin-bottom: 10px;
  margin-top: 10px;
  padding: 15px 20px;
  font-weight: 600;
  color: #fff;
  font-size: 1.1em;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-button[data-id="1"] {
  background-color: #4caf50 !important;
}
.action-button[data-id="1"]:hover {
  background-color: #43a047 !important;
}

.action-button[data-id="2"] {
  background-color: #4caf50 !important;
}
.action-button[data-id="2"]:hover {
  background-color: #43a047 !important;
}

.action-button[data-id="3"] {
  background-color: #d32f2f !important;
}
.action-button[data-id="3"]:hover {
  background-color: #c62828 !important;
}

.action-button[data-id="4"] {
  background-color: #2196f3 !important;
}
.action-button[data-id="4"]:hover {
  background-color: #1e88e5 !important;
}

.action-button[data-id="5"] {
  background-color: #ff9800 !important;
}
.action-button[data-id="5"]:hover {
  background-color: #fb8c00 !important;
}

.action-button[data-id="6"] {
  background-color: #9c27b0 !important;
}
.action-button[data-id="6"]:hover {
  background-color: #8e24aa !important;
}

.action-button[data-id="7"] {
  background-color: #4caf50 !important;
}
.action-button[data-id="7"]:hover {
  background-color: #43a047 !important;
}

/* Styles for confirmation pop-up */
.confirmation-popup, .modal {
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

.modal::before,
.confirmation-popup::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(8px);
}

.modal .modal-content,
.confirmation-popup .popup-content {
  position: relative;
  background: #ffffff;
  padding: 30px;
  border-radius: 25px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
  border: 4px solid #2ecc71;
  text-align: center;
  min-width: 400px;
  z-index: 99999999;
  animation: popup-appear 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Remove the blanket hide-all rule */
/* body:has(.modal),
body:has(.confirmation-popup) {
  overflow: hidden;
} */

/* Remove the blanket hide-all rule */
/* .modal ~ *,
.confirmation-popup ~ * {
  display: none !important;
} */

/* Add specific rules for what should be blurred/hidden */
.blur-content {
  filter: blur(5px);
  pointer-events: none;
  user-select: none;
}

/* Ensure error and success popups stay above modals */
.error-popup,
.success-popup {
  position: fixed;
  top: 30px;
  right: 30px;
  z-index: 10000000;
  pointer-events: auto;
  user-select: auto;
}

.modal-content h2,
.popup-content h2 {
  font-size: 1.8em;
  color: #34495e;
  margin-bottom: 25px;
  font-weight: 600;
}

.modal-content-main{
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}
.modal-content-main div{
  display: flex;
  align-items: center;
  gap: 5px;
}
.modal-content-main select{
  padding: 5px 8px;
}
.hall{
  display: flex;
  align-items: center;
  flex-direction: column;

}

.modal-content-button,
.popup-content-button{
  display: flex;
  justify-content: center;
  gap: 40px;
}
.cancel-button {
  background-color: #fd5c63;
  color: #fff;
  font-weight: 600;
  transition: all 0.3s ease-in-out;
}
.cancel-button:hover{
  background-color: #e6313a;
}
.confirm-button{
  background-color: rgb(121, 194, 12);
  color: #fafafa;
  font-weight: 600;
  transition: all 0.3s ease-in-out;
}
.confirm-button:hover{
  background-color: rgb(145, 223, 27);
}

.popup-content {
  text-align: center;
}

.confirmation-popup button {
  margin: 5px;
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
  color: white;
}

.print-check-btn {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  box-shadow: 0 4px 15px rgba(46, 204, 113, 0.2);
}

.print-check-btn:hover {
  background: linear-gradient(135deg, #27ae60, #219a52);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 204, 113, 0.3);
}

.cancel-check-btn {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.2);
}

.cancel-check-btn:hover {
  background: linear-gradient(135deg, #c0392b, #a93226);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.3);
}

.finalize-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.2);
}

.finalize-btn:hover {
  background: linear-gradient(135deg, #2980b9, #2471a3);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.3);
}

.actions-container {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .actions-container {
    width: 100%;
    overflow-x: auto;
    padding: 10px;
    -webkit-overflow-scrolling: touch;
  }

  .admin-actions {
    flex-wrap: nowrap;
    width: max-content;
    padding-bottom: 5px; /* Space for the scrollbar */
  }

  .action-button {
    min-width: 130px;
    margin: 0 5px;
    white-space: nowrap;
  }
}

/* Hide scrollbar for Chrome, Safari and Opera */
.actions-container::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.actions-container {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.popup-overlay ~ .content-container,
.popup-overlay ~ .header-container {
  display: none !important;
}

.modal-title {
  font-size: 1.8em;
  color: #34495e;
  margin-bottom: 25px;
  font-weight: 600;
}

.modal-content-main {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.modal-content-main div {
  display: flex;
  align-items: center;
  gap: 5px;
}

.modal-content-main select {
  padding: 5px 8px;
}

.hall {
  display: flex;
  align-items: center;
  flex-direction: column;
}

/* Modal styles */
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
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(8px);
}

.confirmation-dialog {
  position: relative;
  background: #ffffff;
  border-radius: 25px;
  padding: 35px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
  border: 4px solid #2ecc71;
  text-align: center;
  min-width: 400px;
  z-index: 99999999;
  animation: popup-appear 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.confirmation-message {
  font-size: 1.8em;
  color: #34495e;
  margin-bottom: 35px;
  line-height: 1.6;
  padding: 0 20px;
  font-weight: 600;
}

.confirmation-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  padding: 10px 0;
}

.confirm-btn,
.cancel-btn {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
  padding: 16px 35px;
  border-radius: 15px;
  font-weight: 700;
  font-size: 1.3em;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.cancel-btn {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.confirm-btn:hover {
  background: linear-gradient(135deg, #27ae60, #219a52);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(46, 204, 113, 0.4);
}

.cancel-btn:hover {
  background: linear-gradient(135deg, #c0392b, #a93226);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(231, 76, 60, 0.4);
}

@keyframes popup-appear {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(-40px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-title {
  font-size: 1.8em;
  color: #34495e;
  margin-bottom: 25px;
  font-weight: 600;
}

.modal-content-main {
  margin-bottom: 30px;
}

.modal-content-main label {
  display: block;
  margin-bottom: 10px;
  font-size: 1.2em;
  color: #2c3e50;
}

.modal-content-main select {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 2px solid #e9ecef;
  font-size: 1.1em;
  margin-bottom: 15px;
  background: #fff;
  color: #2c3e50;
  transition: all 0.3s ease;
}

.modal-content-main select:focus {
  border-color: #2ecc71;
  outline: none;
  box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.2);
}

.hall {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Mobile Responsive Adjustments */
@media (max-width: 768px) {
  .confirmation-dialog {
    width: 90%;
    min-width: unset;
    padding: 25px;
    margin: 20px;
  }

  .confirmation-message {
    font-size: 1.2em;
    padding: 0 10px;
  }

  .confirm-btn,
  .cancel-btn {
    padding: 14px 25px;
    font-size: 1.1em;
    min-width: 130px;
  }
}

@media (max-width: 480px) {
  .confirmation-buttons {
    flex-direction: column;
    gap: 15px;
  }

  .confirm-btn,
  .cancel-btn {
    width: 100%;
  }
}

.action-button {
  background: #ffffff;
  color: #2c3e50;
  border: none;
  padding: 15px 20px;
  font-size: 1.1em;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
  width: 100%;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-button:hover {
  background: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-button[data-kitchen="true"] {
  background: #4caf50;
  color: white;
}

.action-button[data-kitchen="true"]:hover {
  background: #43a047;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
