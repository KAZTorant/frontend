<template>
  <div class="actions">
    <!-- Dynamically create buttons for actions -->
    <button class="action-button" v-for="action in actions" :key="action.id" @click="handleAction(action.method)">
      {{ action.label }}
    </button>
    <!-- Modal for transfer action -->
    <div v-if="showTransferModal" class="modal">
      <div class="modal-content">
        <h2>Transfer Dish</h2>
        <label for="hall">Select Hall:</label>
        <select id="hall" v-model="selectedHall"  @change="fetchTablesForHall(selectedHall)">
          <!-- Options for halls -->
          <option v-for="(hall, index) in halls" :key="index" :value="hall.id">{{ hall.name }}</option>
        </select>
        <label for="table">Select Table:</label>
        <select id="table" v-model="selectedTable">
          <!-- Options for tables -->
          <option v-for="(table, index) in tables" :key="index" :value="table.id">{{ table.number }}</option>
        </select>
        <div>
          <button @click="confirmTransfer">Confirm</button>
          <button @click="cancelTransfer">Cancel</button> <!-- Added Cancel button -->
        </div>
      </div>
    </div>
    <!-- Error popup -->
    <error-popup :error-message="error" v-if="error" @close="clearError" />
  </div>
</template>

<script>
import ErrorPopup from '@/components/ErrorPopup.vue';
import backendServices from '@/backend-services/backend-services';
import router  from '@/router/'; // Import the router instance

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
        { id: 2, label: 'Combine', method: 'combineTables' },
        { id: 3, label: 'Cancel', method: 'cancelOrder' },
        { id: 4, label: 'Stolu köçürt', method: 'openTransferModal' },
        // Add more actions as needed
      ],
      showTransferModal: false,
      selectedHall: null,
      selectedTable: null,
      halls: [], // Populate with halls data from backend
      tables: [], // Populate with tables data from backend based on selected hall
      error: null
    };
  },
  async created() {
  },
  methods: {
    cancelTransfer() {
      this.showTransferModal = false; // Close the modal
      // Optionally, you can reset the selectedHall and selectedTable values here if needed
    },

    async handleAction(methodName) {
      if (methodName === 'openTransferModal') {
        this.showTransferModal = true;
        await this.fetchHalls();
      } else {
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
        
        if(this.tables.length === 0)
          this.showError('Zalda boş masa yoxdur.'); // Show error popup

        if(this.tables !== null && this.tables.length > 0) {
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

        if(this.halls !== null && this.halls.length > 0) {
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
</style>
