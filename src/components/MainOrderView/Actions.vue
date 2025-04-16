    <template>
      <div class="actions">
        <button 
          class="action-button" 
          v-for="action in filteredActions" 
          :key="action.id" 
          @click="handleAction(action.method, action.id)" 
          :data-method="action.method" 
          :data-id="action.id" 
          :class="{ 'green-button': action.method === 'printOrder' && buttonColor === '#74E291' }"
        >
          {{ action.label }}
        </button>

        <!-- Error and Success popups -->
        <ErrorPopup v-if="error" :error-message="error" @close="clearError" />
        <SuccessPopup v-if="successMessage" :success-message="successMessage" @close="clearSuccess" />

        <!-- All Modals -->
        <Teleport to="body">
          <!-- Confirmation Dialog -->
          <div v-if="showConfirmation" class="modal-container">
            <div class="modal-overlay"></div>
            <div class="confirmation-dialog">
              <div class="confirmation-message">
                Masanı bağlamağa əminsiniz?
              </div>
              <div class="confirmation-buttons">
                <button class="confirm-btn" @click="confirmAction">Hə</button>
                <button class="cancel-btn" @click="cancelAction">Yox</button>
              </div>
            </div>
          </div>

          <!-- Transfer Modal -->
          <div v-if="showTransferModal" class="modal-container">
            <div class="modal-overlay"></div>
            <div class="confirmation-dialog">
              <h2 class="modal-title">Masanı köçür</h2>
              <div class="modal-content-main hall">
                <div>
                  <label for="hall">Zal Seç:</label>
                  <select id="hall" v-model="selectedHall" @change="fetchTablesForHall">
                    <option v-for="hall in halls" :key="hall.id" :value="hall.id">{{ hall.name }}</option>
                  </select>
                </div>
                <div>
                  <label for="table">Masa seç:</label>
                  <select id="table" v-model="selectedTable">
                    <option v-for="table in tables" :key="table.id" :value="table.id">{{ table.number }}</option>
                  </select>
                </div>
              </div>
              <div class="confirmation-buttons">
                <button class="confirm-btn" @click="confirmTransfer">Təsdiqlə</button>
                <button class="cancel-btn" @click="cancelTransfer">Ləğv et</button>
              </div>
            </div>
          </div>

          <!-- Waitress Change Modal -->
          <div v-if="showWaitressModal" class="modal-container">
            <div class="modal-overlay"></div>
            <div class="confirmation-dialog">
              <h2 class="modal-title">Ofsianti dəyiş</h2>
              <div class="modal-content-main">
                <label for="waitress">Ofsiant seç:</label>
                <select id="waitress" class="waitress" v-model="selectedWaitress">
                  <option v-for="waitress in waitresses" :key="waitress.id" :value="waitress.id">
                    {{ waitress.full_name }}
                  </option>
                </select>
              </div>
              <div class="confirmation-buttons">
                <button class="confirm-btn" @click="confirmWaitressChange">Təsdiqlə</button>
                <button class="cancel-btn" @click="cancelWaitressChange">Ləğv et</button>
              </div>
            </div>
          </div>

          <!-- Combine Modal -->
          <div v-if="showCombineModal" class="modal-container">
            <div class="modal-overlay"></div>
            <div class="confirmation-dialog">
              <h2 class="modal-title">Masanı birləşdir</h2>
              <div class="modal-content-main hall">
                <div>
                  <label for="combine-hall">Zal Seç:</label>
                  <select id="combine-hall" v-model="selectedHall" @change="fetchTablesForCombine">
                    <option v-for="hall in halls" :key="hall.id" :value="hall.id">{{ hall.name }}</option>
                  </select>
                </div>
                <div>
                  <label for="combine-table">Masa seç:</label>
                  <select id="combine-table" v-model="selectedTable">
                    <option v-for="table in tables" :key="table.id" :value="table.id">{{ table.number }}</option>
                  </select>
                </div>
              </div>
              <div class="confirmation-buttons">
                <button class="confirm-btn" @click="confirmCombine">Birləşdir</button>
                <button class="cancel-btn" @click="cancelCombine">Ləğv et</button>
              </div>
            </div>
          </div>
        </Teleport>
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
        },
        role: {
          type: String,
          required: true
        },
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
      computed: {
        filteredActions() {
          if (this.role === 'admin' || this.role === 'restaurant') {
            return this.actions;
          } else if (this.role === 'waitress') {
            return this.actions.filter(action => action.id === 7);
          }
          return [];
        }
      },
      async mounted() {
        if (this.role !== 'waitress') {
          await this.fetchTableDetailsAndUpdateButtonColor();
          await this.fetchHalls();
          await this.fetchTablesForHall();
          await this.fetchTablesForCombine();
          await this.fetchWaitresses();
        }
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

        async handleAction(methodName, actionId) {
          if (this.role === 'waitress' && actionId !== 7) {
            return;
          }
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
          this.fetchTablesForCombine();
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
            this.tables = tables.filter(table => {
              return Number(table.id) !== Number(this.tableId) && table.waitress && table.waitress.id !== 0;
            });

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
.actions {
  width: 100%;
  display: flex;
  gap: 10px;
  padding: 10px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  white-space: nowrap;
}

.action-button {
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 130px;
  height: 58px;
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

.green-button {
  background-color: #74E291 !important;
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
  font-size: 1.5em;
  color: #2c3e50;
  margin-bottom: 25px;
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

@media (max-width: 768px) {
  .actions {
    padding: 10px;
    gap: 8px;
  }

  .action-button {
    min-width: 120px;
    height: 50px;
    padding: 12px 16px;
    font-size: 1em;
  }

  .confirmation-dialog {
    min-width: 300px;
    margin: 20px;
    padding: 20px;
  }

  .confirmation-message {
    font-size: 1.2em;
  }

  .confirm-btn,
  .cancel-btn {
    padding: 10px 20px;
    font-size: 1em;
    min-width: 100px;
  }
}

@media (max-width: 480px) {
  .action-button {
    min-width: 110px;
    height: 45px;
    padding: 10px 14px;
    font-size: 0.9em;
  }
}
</style>
