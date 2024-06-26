<template>
  <div class="logout-head">
    <div class="waiterssName">{{ roleDisplayName }}: {{ waitressName }}</div>
    <button @click="logout" class="logout-button">Çıxış</button>
  </div>
  <div class="layout">
    <div v-for="table in tables" :key="table.id" :class="['table', {
      'occupied': table.waitress.name,
      'waitress-id-zero': table.waitress.id === 0,
      'waitress-id-not-zero': table.waitress.id !== 0 && !table.print_check,
      'check-printed': table.print_check,
      'not-current-waitress': isWaitress && table.waitress.name && table.waitress.name !== waitressName
    }]" @click="isTableClickable(table) ? goToMainOrderView(table.id) : null">
      <div>{{ table.number }}</div>
      <div v-if="table.waitress.name">Ofsiant: {{ table.waitress.name }}</div>
      <div v-if="table.total_price">Cemi Hesab: {{ table.total_price }}azn</div>
      <div v-if="table.serviceTax">Servis: {{ 0 }}azn</div>
    </div>
  </div>
  <!-- Container for the fixed halls menu -->
  <div class="halls-container">
    <div class="halls">
      <div v-for="hall in halls" :key="hall.id"
        :class="['hall', { 'clicked': hall.id === parseInt(this.$route.params.id) }]"
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
import router from '../../router/'; // Import the router instance
import store from '../../store';

export default {
  components: {
    TableComponent,
    HallListComponent
  },
  data() {
    return {
      tables: [],
      halls: [],
      waitressName: "",
      roleDisplayName: "",
      intervalId: null // Added to hold the interval ID
    }
  },
  computed: {
    isWaitress() {
      return this.role === 'waitress';
    }
  },
  created() {
    // Call fetchRooms method from backendServices during creation
    this.waitressName = store.getters['auth/GET_FULL_NAME'];
    this.role = store.getters['auth/GET_ROLE'];

    if (this.role === "admin") {
      this.roleDisplayName = "Adminstrator";
    } else if (this.role === "waitress") {
      this.roleDisplayName = "Ofsiant";
    } else if (this.role === "restaurant") {
      this.roleDisplayName = "Restorant sahibi";
    }

    this.fetchRooms();
    this.fetchTablesByHallId(this.$route.params.id);

    if (store.getters['auth/GET_ROLE'] === "admin" || store.getters['auth/GET_ROLE'] === "restaurant") {
      this.intervalId = setInterval(() => {
        this.fetchTablesByHallId(this.$route.params.id);
      }, 5000);
    }
  },
  beforeUnmount() {
      clearInterval(this.intervalId);
  },
  methods: {
    logout() {
      this.$store.commit('auth/SET_AUTHENTICATION', null);
      this.$store.commit('auth/SET_ROLE', null); // Assuming you are using username for username here
      this.$store.commit('auth/SET_USERNAME', null);
      router.push('/');
    },

    // Methods to manage the state
    async fetchRooms() {
      try {
        // Call fetchRooms method from backendServices and update data
        const rooms = await backendServices.fetchRooms();
        this.halls = rooms; // Assuming rooms is an array of table objects
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    },
    async fetchTablesByHallId(id) {
      try {
        this.$router.push('/home/' + id);
        const tables = await backendServices.fetchTablesByHallId(id);
        this.tables = tables;
      } catch (error) {
        console.error(`Error fetching tables for ID ${id}:`, error);
        throw error;
      }
    },
    goToMainOrderView(tableId) {
      // Navigate to main-order-view page with tableId
      router.push('/home/' + this.$route.params.id + '/main-order-view/' + tableId);
    },
    isTableClickable(table) {
      return !(this.isWaitress && table.waitress.name && table.waitress.name !== this.waitressName);
    }
  }
}
</script>


<style>
.check-printed {
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

.not-current-waitress {
  background-color: gray;
  pointer-events: none;
}

.logout-head {
  display: flex;
  justify-content: center;
  overflow-x: auto;
}

.waiterssName {
  white-space: nowrap;
  size: 40px !important;
  color: black;
  font-weight: 700;
  padding: 20px;
  margin: 10px;
  padding-bottom: 10px;
  background-color: bisque;
  border-radius: 4px 4px 0 0;
}

.logout-button,
.tables-view {
  width: 140px;
  margin: 10px;
  padding: 20px 28px;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  font-weight: 600;
  font-size: 16px;
}

.logout-button {
  background-color: #fd5c63;
  transition: all 0.3s ease-in-out;
}

.logout-button:hover {
  background-color: #e6313a;
}

html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow-x: hidden;
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
  position: -webkit-sticky;
  /* For Safari */
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
  width: 100%;
  /* Ensures the menu stretches across the viewport */
  z-index: 1000;
  /* Ensures the menu appears above other content */
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
