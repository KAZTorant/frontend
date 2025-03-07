<template>
  <div class="actions">
    <!-- Dynamically create buttons for actions -->
    <button class="action-button" v-for="action in actions" :key="action.id" @click="handleAction(action.method)" :data-method="action.method" :data-id="action.id" :class="{ 'green-button': action.method === 'printOrder' && buttonColor === '#74E291' } ">
      {{ action.label }}
    </button>
    <!-- Modal for transfer action -->
    <div v-if="showTransferModal" class="modal">
      <div class="modal-content">
        <h2>Masanı köçür</h2>
        <div class="modal-content-main hall">
          <div>
            <label for="hall">Zal Seç:</label>
            <select id="hall" v-model="selectedHall" @change="fetchTablesForHall(selectedHall)">
              <!-- Options for halls -->
              <option v-for="(hall, index) in halls" :key="index" :value="hall.id">{{ hall.name }}</option>
            </select>
          </div>
          <div>
            <label for="table">Masa seç:</label>
            <select id="table" v-model="selectedTable">
              <!-- Options for tables -->
              <option v-for="(table, index) in tables" :key="index" :value="table.id">{{ table.number }}</option>
            </select>
          </div>
        </div>
        <div class="modal-content-button">
          <button class="confirm-button" @click="confirmTransfer">Təsdiqlə</button>
          <button class="cancel-button" @click="cancelTransfer">Ləğv et</button> <!-- Added Cancel button -->
        </div>
      </div>
    </div>

<!-- Modal for combine action -->
<div v-if="showCombine" class="modal">
  <div class="modal-content">
    <h2>Masanı birləşdir</h2>
    <div class="modal-content-main hall">
      <div>
        <label for="hall">Zal Seç:</label>
        <select id="hall" v-model="selectedHall" @change="fetchTablesForCombine(selectedHall)">
          <!-- Options for halls -->
          <option v-for="(hall, index) in halls" :key="index" :value="hall.id">{{ hall.name }}</option>
        </select>
      </div>
      <div>
        <label for="table">Masa seç:</label>
        <select id="table" v-model="selectedTable">
          <!-- Options for tables -->
          <option v-for="(table, index) in tables" :key="index" :value="table.id">{{ table.number }}</option>
        </select>
      </div>
    </div>
    <div class="modal-content-button">
      <button class="confirm-button" @click="confirmCombine">Birləşdir</button>
      <button class="cancel-button" @click="cancelCombine">Ləğv et</button>
    </div>
  </div>
</div>


    <div v-if="showWaitressChangeModal" class="modal">
      <div class="modal-content">
        <h2>Ofsianti dəyiş</h2>
        <div class="modal-content-main">
          <label for="waitress">Ofsiant seç:</label>
          <select id="waitress" class="waitress" v-model="selectedWaitress">
            <!-- Options for waitresses -->
            <option v-for="waitress in waitresses" :key="waitress.id" :value="waitress.id">{{ waitress.full_name }}
            </option>
          </select>
        </div>
        <div class="modal-content-button">
          <button class="confirm-button" @click="confirmWaitressChange">Təsdiqlə</button>
          <button class="cancel-button" @click="cancelWaitressChange">Ləğv et</button>
        </div>
      </div>
      
    </div>

    <!-- Confirmation pop-up -->
    <div v-if="showConfirmationPopup" class="confirmation-popup">
      <div class="popup-content">
        <h2>Masanı bağlamaga əminsiniz?</h2>
        <div class="popup-content-button">
          <button class="cancel-button" @click="cancelCloseOrder">Yox</button>
          <button class="confirm-button" @click="confirmCloseOrder">Hə</button>
        </div>
      </div>
    </div>
    <!-- Error popup -->
    <error-popup :error-message="error" v-if="error" @close="clearError" />
    <success-popup :success-message="successMessage" v-if="successMessage" @close="clearSuccess" />
  </div>
</template>

<script>
import ErrorPopup from '@/components/ErrorPopup.vue';
import SuccessPopup from '@/components/SuccessPopup.vue';
import backendServices from '@/backend-services/backend-services';
import router from '@/router/'; // Import the router instance

export default {
  components: {
    ErrorPopup,
    SuccessPopup
  },
  name: 'Actions',
  props: {
    tableId: {
      type: Number,
      required: true
    },
  },
  data() {
    return {
      actions: [
        { id: 1, label: 'Print Çek', method: 'printOrder' },
        { id: 5, label: 'Çeki ləğv et', method: 'cancelPrintOrder' },
        { id: 2, label: 'Ofsianti dəyiş', method: 'changeWaitress' },
        { id: 3, label: 'Masanı bağla', method: 'cancelOrder' },
        { id: 4, label: 'Masanı köçür', method: 'openTransferModal' },
        { id: 6, label: 'Masanı birləşdir', method: 'openCombine' },
        // Add more actions as needed
      ],
      showCombine: false,
      showTransferModal: false,
      selectedHall: null,
      selectedTable: null,
      halls: [], // Populate with halls data from backend
      tables: [], // Populate with tables data from backend based on selected hall
      error: null,
      successMessage: null,
      showConfirmationPopup: false, // Flag to show confirmation pop-up
      waitresses: [], // Populate with waitresses data from backend
      selectedWaitress: null, // Track the selected waitress
      showWaitressChangeModal: false,
      buttonColor: ''

    };
  },
  async mounted() {
  await this.fetchTableDetailsAndUpdateButtonColor();
},
  methods: {
    async fetchTableDetailsAndUpdateButtonColor() {
    try {
      const tableResponse = await backendServices.fetchTableDetails(this.tableId);
      this.print_check = tableResponse.print_check;
      console.log(this.print_check)
      // Set button color based on print_check value
      this.buttonColor = this.print_check ? '#74E291' : '';

    } catch (error) {
      console.error('Error fetching table details:', error);
      this.showError('Error fetching table details. Please try again later.');
    }
  },
    openWaitressChangeModal() {
      this.showWaitressChangeModal = true;
      // Fetch waitresses data when modal opens
      this.fetchWaitresses();
    },

    async fetchWaitresses() {
      try {
        // Call fetchWaitresses method from backendServices and update data
        const waitresses = await backendServices.fetchWaitresses();
        this.waitresses = waitresses; // Assuming waitresses is an array of waitress objects
        // Select the first waitress by default
        if (this.waitresses.length > 0) {
          this.selectedWaitress = this.waitresses[0].id;
        }
      } catch (error) {
        console.error('Error fetching waitresses:', error);
        this.showError('Error fetching waitresses. Please try again later.'); // Show error popup
      }
    },

    async confirmWaitressChange() {
      try {
        // Call changeWaitressForOrder method with selected waitress ID
        await backendServices.changeWaitressForOrder(this.tableId, this.selectedWaitress);
        console.log('Waitress changed successfully');
        // Optionally, you can close the modal after successful change
        this.showWaitressChangeModal = false;
        // Optionally, you can refresh the table data or update UI as needed
        router.back();
      } catch (error) {
        console.error('Error changing waitress:', error);
        this.showError('Error changing waitress. Please try again later.'); // Show error popup
      }
    },
    cancelTransfer() {
      this.showTransferModal = false; // Close the modal
      // Optionally, you can reset the selectedHall and selectedTable values here if needed
    },
    cancelWaitressChange(){
      this.showWaitressChangeModal=false;
    },

    async handleAction(methodName) {
      if (methodName === 'openTransferModal') {
        this.showTransferModal = true;
        await this.fetchHalls();
      } else if (methodName === 'cancelOrder') {
        // Show confirmation pop-up for canceling order
        this.showConfirmationPopup = true;
      } else if (methodName === 'changeWaitress') {
        // Show confirmation pop-up for canceling order
        this.openWaitressChangeModal();
      } else if (methodName === 'printOrder') {
        // Show confirmation pop-up for canceling order
        await this.callPrintOrder(this.tableId);
      } else if (methodName === 'cancelPrintOrder') {
        // Show confirmation pop-up for canceling order
        await this.callCanelPrintOrder(this.tableId);
      } else if (methodName === 'openCombine') {
        this.showCombine = true;
        await this.fetchHalls();
        await this.fetchTablesForCombine(this.selectedHall);
      }
      else {
        this.performAction(methodName);
      }
    },
    async callPrintOrder(tableId){
      try {
        await backendServices.printCheck(tableId);
        console.log('Check printed successfully');
        this.showSuccess('Çek print olundu.'); // Show error popup

        await this.fetchTableDetailsAndUpdateButtonColor();
      // Update data property to keep track of the color
      } catch (error) {
        console.error('Error printing check:', error);
        this.showError('Çek print olunub artıq.');
      }
    },
    async callCanelPrintOrder(tableId){
      try {
        await backendServices.deleteCheck(tableId);
        console.log('Check cancelled successfully');
        this.showSuccess('Çek leğv olundu.'); // Show error popup

        await this.fetchTableDetailsAndUpdateButtonColor();

      } catch (error) {
        console.error('Error cancelling check:', error);
        this.showError('Çeki ləğv etmədə problem yarandı.');
      }
    },
    changeButtonColor(methodName, color) {
      const button = this.$el.querySelector(`.action-button[data-method="${methodName}"]`);
      if (button) {
        button.style.backgroundColor = color;
      }
    },
    performAction(methodName) {
      // Implementation for other actions
    },
    confirmTransfer() {
      if (this.selectedHall && this.selectedTable) {
        backendServices.changeTableForOrder(this.tableId, this.selectedTable)
          .then(data => {
            console.log('Table changed successfully:', data);
            this.showTransferModal = false; // Close modal after successful transfer
            router.back();
          })
          .catch(error => {
            console.error('Error changing table:', error);
            this.showError('Masa məşquldur.'); // Show error popup
          });
      }
    },
    
    async confirmCombine() {
  if (!this.selectedTable) {
    this.showError('Zəhmət olmasa, bir masa seçin.'); // Masa seçməyinizi istə
    return;
  }

  try {
    const orderId = [this.selectedTable]; 

    await backendServices.combineTables(this.tableId, orderId); 

    this.showSuccess('Masa birləşdirildi!'); 
    this.cancelCombine();
    router.back();
  } catch (error) {
    console.error('Error combining tables:', error);
    this.showError('Masa birləşdirilərkən xəta baş verdi. Zəhmət olmasa, daha sonra yenidən cəhd edin.'); 
  }
},

cancelCombine() {
  this.showCombine = false; 
  this.selectedTable = null; 
  this.tables = [];
},


  async fetchTablesForHall(selectedHallId) {
      try {
        const tables = await backendServices.fetchTablesByHallId(selectedHallId);
        this.tables = tables.filter(table => table.waitress.id === 0); // Filter tables where waitress.id is 0

        if (this.tables.length === 0)
          this.showError('Zalda boş masa yoxdur.'); // Show error popup

        if (this.tables !== null && this.tables.length > 0) {
          this.selectedTable = this.tables[0].id;
        }
      } catch (error) {
        console.error(`Error fetching tables for ID ${selectedHallId}:`, error);
        this.showError('Error fetching tables. Please try again later.'); // Show error popup
      }
    },
    async fetchTablesForCombine(selectedHallId) {
    try {
      console.log(this.tableId)
      const tables = await backendServices.fetchTablesByHallId(selectedHallId);

      this.tables = tables.filter(table => table.waitress.id !== 0 && table.id !== this.tableId); 

      if (this.tables.length === 0) {
        this.showError('Zalda dolu masa yoxdur.');
      }

      if (this.tables.length > 0) {
        this.selectedTable = this.tables[0].id;
      }
    } catch (error) {
      console.error(`Error fetching tables for ID ${selectedHallId}:`, error);
      this.showError('Zalda masalar gətirilərkən xəta baş verdi.');
    }
  },

    async fetchHalls() {
      try {
        // Call fetchRooms method from backendServices and update data
        const rooms = await backendServices.fetchRooms();
        this.halls = rooms; // Assuming rooms is an array of table objects

        if (this.halls !== null && this.halls.length > 0) {
          this.selectedHall = this.halls[0].id;
          await this.fetchTablesForHall(this.selectedHall);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
        this.showError('Error fetching halls. Please try again later.'); // Show error popup
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
    confirmCloseOrder() {
      // Call closeTableForOrder method and handle the response
      backendServices.closeTableForOrder(this.tableId)
        .then(data => {
          console.log('Table closed successfully:', data);
          router.back();
        })
        .catch(error => {
          console.error('Error closing table:', error);
          this.showError('Error closing table. Please try again later.'); // Show error popup
        });
      this.showConfirmationPopup = false; // Close confirmation pop-up
    },
    cancelCloseOrder() {
      this.showConfirmationPopup = false; // Close confirmation pop-up
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

.action-button, 
.modal-content-button button,
.popup-content-button button {
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.modal-content-button button,
.popup-content-button button {
  padding: 20px 30px;
}
.action-button{
  min-width: 130px;
  height: 58px;
  margin-bottom: 10px;
  margin-top: 10px;
  padding: 16px;
}
.actions button[data-id="3"],
.actions button[data-id="5"]{
  background-color: #fd5c63;
  color: #fff;
  font-weight: 600;
  transition: all 0.3s ease-in-out
}
.actions button[data-id="3"]:hover,
.actions button[data-id="5"]:hover{
  background-color: #e6313a;
  color: #fff;
  font-weight: 600
}
.actions button[data-id="2"],
.actions button[data-id="4"]{
  background-color: #ffa500;
  color: #fff;
  font-weight: 600;
  transition: all 0.3s ease-in-out
}
.actions button[data-id="2"]:hover,
.actions button[data-id="4"]:hover{
  background-color: #f7b845;
}

.action-button:hover{
  /* Hover state for buttons */
  background-color: #e2e2e2;
}

/* Styles for confirmation pop-up */
.confirmation-popup,.modal{
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10000;
}
.modal-content h2{
  margin: 0;
}
.modal .modal-content{
  width: 300px;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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
</style>
