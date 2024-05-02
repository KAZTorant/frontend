<template>
  <div class="actions">
    <!-- Dynamically create buttons for actions -->
    <button class="action-button" v-for="action in actions" :key="action.id" @click="handleAction(action.method)">
      {{ action.label }}
    </button>
    <!-- Modal for transfer action -->
    <div v-if="showTransferModal" class="modal">
      <div class="modal-content">
        <h2>Masanı köçürt</h2>
        <label for="hall">Zal Seç:</label>
        <select id="hall" v-model="selectedHall" @change="fetchTablesForHall(selectedHall)">
          <!-- Options for halls -->
          <option v-for="(hall, index) in halls" :key="index" :value="hall.id">{{ hall.name }}</option>
        </select>
        <label for="table">Stol seç:</label>
        <select id="table" v-model="selectedTable">
          <!-- Options for tables -->
          <option v-for="(table, index) in tables" :key="index" :value="table.id">{{ table.number }}</option>
        </select>
        <div>
          <button @click="confirmTransfer">Təsdiqlə</button>
          <button @click="cancelTransfer">Ləğv et</button> <!-- Added Cancel button -->
        </div>
      </div>
    </div>

    <div v-if="showWaitressChangeModal" class="modal">
      <div class="modal-content">
        <h2>Ofsianti dəyiş</h2>
        <label for="waitress">Ofsiant seç:</label>
        <select id="waitress" v-model="selectedWaitress">
          <!-- Options for waitresses -->
          <option v-for="waitress in waitresses" :key="waitress.id" :value="waitress.id">{{ waitress.full_name }}
          </option>
        </select>
        <div>
          <button @click="confirmWaitressChange">Təsdiqlə</button>
          <button @click="cancelWaitressChange">Ləğv et</button>
        </div>
      </div>
    </div>

    <!-- Confirmation pop-up -->
    <div v-if="showConfirmationPopup" class="confirmation-popup">
      <div class="popup-content">
        <p>Masanı bağlamaga əminsiniz?</p>
        <button @click="cancelCloseOrder">Yox</button>
        <button @click="confirmCloseOrder">Hə</button>
      </div>
    </div>
    <!-- Error popup -->
    <error-popup :error-message="error" v-if="error" @close="clearError" />
  </div>
</template>

<script>
import ErrorPopup from '@/components/ErrorPopup.vue';
import backendServices from '@/backend-services/backend-services';
import router from '@/router/'; // Import the router instance

export default {
  components: {
    ErrorPopup
  },
  name: 'Actions',
  props: {
    tableId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      actions: [
        { id: 1, label: 'Print', method: 'printOrder' },
        { id: 2, label: 'Ofsianti deyiş', method: 'changeWaitress' },
        { id: 3, label: 'Masanı bağla', method: 'cancelOrder' },
        { id: 4, label: 'Masanı köçürt', method: 'openTransferModal' },
        // Add more actions as needed
      ],
      showTransferModal: false,
      selectedHall: null,
      selectedTable: null,
      halls: [], // Populate with halls data from backend
      tables: [], // Populate with tables data from backend based on selected hall
      error: null,
      showConfirmationPopup: false, // Flag to show confirmation pop-up
      waitresses: [], // Populate with waitresses data from backend
      selectedWaitress: null, // Track the selected waitress
      showWaitressChangeModal: false
    };
  },
  async created() {
  },
  methods: {
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
        router.push(`/home`);
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
      }
      else {
        this.performAction(methodName);
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
            router.push(`/home`);
          })
          .catch(error => {
            console.error('Error changing table:', error);
            this.showError('Masa məşquldur.'); // Show error popup
          });
      }
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
    confirmCloseOrder() {
      // Call closeTableForOrder method and handle the response
      backendServices.closeTableForOrder(this.tableId)
        .then(data => {
          console.log('Table closed successfully:', data);
          router.push(`/home`);
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
.actions {
  display: flex;
  flex-direction: column;
}

.action-button {
  /* Styling for action buttons */
  margin-bottom: 10px;
  /* Space between buttons */
  padding: 10px;
  background-color: #f0f0f0;
  /* Example color */
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.action-button:hover {
  /* Hover state for buttons */
  background-color: #e2e2e2;
}

/* Styles for confirmation pop-up */
.confirmation-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.popup-content {
  text-align: center;
}

.confirmation-popup button {
  margin: 5px;
}
</style>
