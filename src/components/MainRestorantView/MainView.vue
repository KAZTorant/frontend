// MainComponent.vue
<!-- MainComponent.vue -->
<template>
  <div class="layout">
    <div v-for="table in tables" :key="table.id" :class="['table', { 'occupied': table.waitress.name }]" @click="goToMainOrderView(table.id)">
      <div>Stol Nomre: {{ table.number }}</div>
      <div v-if="table.waitress.name">Ofsiant: {{ table.waitress.name }}</div>
      <div v-if="table.total_price">Cemi Hesab: {{ table.total_price }}azn</div>
      <div v-if="table.serviceTax">Servis: {{ 0 }}azn</div>
    </div>
  </div>
  <!-- Container for the fixed halls menu -->
  <div class="halls-container">
    <div class="halls">
      <div v-for="hall in halls" :key="hall.id" class="hall"  @click="fetchTablesByHallId(hall.id)">
        <div>{{ hall.name }}</div>
        <div>{{ hall.description }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import TableComponent from './TableComponent.vue';
import HallListComponent from './HallListComponent.vue';
import backendServices from '../../backend-services/backend-services'; // Import your backendServices object
import router  from '../../router/'; // Import the router instance

export default {
  components: {
    TableComponent,
    HallListComponent
  },
  data() {
    return {
      tables: [
      
      ],
      halls: [
       
        // Array of hall objects
      ]
    }
  },
  created() {
    // Call fetchRooms method from backendServices during component creation
    this.fetchRooms();
  },
  methods: {
    // Methods to manage the state
    async fetchRooms() {
      try {
        // Call fetchRooms method from backendServices and update data
        const rooms = await backendServices.fetchRooms();
        this.halls = rooms; // Assuming rooms is an array of table objects

        if(this.halls !== null && this.halls.length > 0) {
          this.fetchTablesByHallId(this.halls[0].id)
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    },
    async fetchTablesByHallId(id) {
      try {
        const tables = await backendServices.fetchTablesByHallId(id); 
        this.tables = tables;
      } catch (error) {
        console.error(`Error fetching tables for ID ${id}:`, error);
        throw error;
      }
    },
    goToMainOrderView(tableId) {
      // Navigate to main-order-view page with tableId
      router.push(`/home/main-order-view/${tableId}`);
    }
  }
}
</script>

<style>
/* Ensure the body and html are set up correctly */
html, body {
  margin: 0;
  padding: 0;
  height: 100%; /* This might be necessary to ensure scrolling context */
  overflow-x: hidden; /* Prevents horizontal overflow at the root level */
}

.layout {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
  margin: 20px;
  min-height: 100vh; /* Ensures there is enough content to scroll */
}

.table {
  border: 2px solid #000;
  background-color: #fff;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  height: 150px;
}

.halls {
  display: flex;
  overflow-x: auto;
  white-space: nowrap;
  align-items: center;
  background-color: #000;
  color: #fff;
  padding: 10px 20px;
  position: -webkit-sticky; /* For Safari */
  position: sticky;
  top: 0;
  z-index: 1000;
}

.hall {
  padding: 10px 20px;
  margin-right: 10px;
  min-width: 100px;
  font-weight: bold;
}

.halls-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%; /* Ensures the menu stretches across the viewport */
  z-index: 1000; /* Ensures the menu appears above other content */
}

@media (max-width: 768px) {
  .layout {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>