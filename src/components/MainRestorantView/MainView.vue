// MainComponent.vue
<!-- MainComponent.vue -->
<template>
  <button @click="logout" class="logout-button">Çıxış</button>
  <div class="waiterssName">{{roleDisplayName}}: {{waitressName}}</div>
  <div class="layout">
    <div v-for="table in tables" :key="table.id" 
     :class="['table', { 
                 'occupied': table.waitress.name,
                 'waitress-id-zero': table.waitress.id === 0,
                 'waitress-id-not-zero': table.waitress.id !== 0 && !table.print_check,
                 'check-printed': table.print_check
               }]" 
     @click="goToMainOrderView(table.id)">      <div>{{ table.number }}</div>
      <div v-if="table.waitress.name">Ofsiant: {{ table.waitress.name }}</div>
      <div v-if="table.total_price">Cemi Hesab: {{ table.total_price }}azn</div>
      <div v-if="table.serviceTax">Servis: {{ 0 }}azn</div>
    </div>
  </div>
  <!-- Container for the fixed halls menu -->
  <div class="halls-container">
    <div class="halls">
      <div v-for="hall in halls" :key="hall.id" :class="['hall', { 'clicked': hall.id === clickedHallId }]"  
        @click="fetchTablesByHallId(hall.id)">
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
import store from '../../store';

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
      ],
      waitressName: "",
      clickedHallId: null, // Add a property to track the clicked hall,
      roleDisplayName: ""
    }
  },
  created() {
    // Call fetchRooms method from backendServices during c
    this.waitressName = store.getters['auth/GET_FULL_NAME'];
    this.role = store.getters['auth/GET_ROLE'];
    
    if(this.role === "admin"){
      this.roleDisplayName = "Adminstrator";
    }else if(this.role === "waitress"){
      this.roleDisplayName = "Ofsiant";
    }else if(this.role === "restaurant"){
      this.roleDisplayName = "Restorant sahibi";
    }

    this.fetchRooms();
  },
  methods: {
    logout() {
          this.$store.commit(`auth/SET_AUTHENTICATION`, null);
          this.$store.commit(`auth/SET_ROLE`, null); // Assuming you are using username for username here
          this.$store.commit(`auth/SET_USERNAME`, null); 
          router.push(`/`);


    },

    // Methods to manage the state
    async fetchRooms() {
      try {
        // Call fetchRooms method from backendServices and update data
        const rooms = await backendServices.fetchRooms();
        this.halls = rooms; // Assuming rooms is an array of table objects

        if(this.halls !== null && this.halls.length > 0) {
          this.clickedHallId = this.halls[0].id; // Set the clicked hall id

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
        this.clickedHallId = id; // Set the clicked hall id
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
.check-printed{
  background-color: greenyellow;
}

.waitress-id-zero {
  background-color: white;
}

.waitress-id-not-zero {
  background-color: #FFDB5C;
}

.hall.clicked {
  background-color: gray !important;
}


.waiterssName{
  size: 40px !important;
  color: black;
  font-weight: 700;
  padding-top: 10px;
  padding-bottom: 10px;
  background-color:bisque;
}

.logout-button, .tables-view {
  /* Add styles for your logout button */
  width: 140px;
  margin: 10px; /* Adjust margin as needed */
  padding: 28px 40px; /* Adjust padding as needed */
  background-color: red; /* Example background color */
  color: white; /* Example text color */
  border: none; /* Remove border if needed */
  cursor: pointer; /* Change cursor to pointer on hover */
  border-radius: 6px;
  font-weight: 600;
  font-size: 16px;
}

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
  margin: 20px 20px 100px;
  
}

.table {
  border: 2px solid #000;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  height: 150px;
  cursor: pointer;
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
@media (max-width: 1008px) {
  .layout {
    grid-template-columns: repeat(4, 1fr);
    padding: 20px;
  }
}
@media (max-width: 768px) {
  .layout {
    grid-template-columns: repeat(3, 1fr);
    padding: 20px;
  }
}
@media (max-width: 558px) {
  .layout {
    grid-template-columns: repeat(2, 1fr);
    padding: 20px;
  }
}

</style>