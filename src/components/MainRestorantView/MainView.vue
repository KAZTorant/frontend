<template>
  <div class="restaurant-background">
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
      this.roleDisplayName = "Admin";
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
/* Background image styling */
.restaurant-background {
  min-height: 100vh;
  width: 100%;
  background-image: url('../../assets/restaurantBackgroundImage.jpeg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  position: relative;
  padding: 40px 20px 0px;
}

/* Add a semi-transparent overlay for better readability */
.restaurant-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4));
  backdrop-filter: blur(1px);
  z-index: 1;
}

.check-printed {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
  border: none;
}

.waitress-id-zero {
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border: 2px solid #e9ecef;
}

.waitress-id-not-zero {
  background: linear-gradient(135deg, #fff3cd, #ffeeba);
  border: 2px solid #ffeeba;
}

.hall.clicked {
  background: linear-gradient(135deg, #2ecc71, #27ae60) !important;
  color: white;
}

.not-current-waitress {
  background: linear-gradient(135deg, #6c757d, #495057);
  color: white;
  pointer-events: none;
}

.logout-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.waiterssName {
  white-space: nowrap;
  color: #2c3e50;
  font-weight: 600;
  padding: 15px 25px;
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  font-size: 1.1em;
  border: 1px solid #e9ecef;
}

.logout-button {
  width: 120px;
  padding: 12px 24px;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  background: linear-gradient(135deg, #ff6b6b, #ff5252);
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 82, 82, 0.2);
}

.logout-button:hover {
  background: linear-gradient(135deg, #ff5252, #ff1744);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 82, 82, 0.3);
}

.layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 20px;
  padding-bottom: 100px;
  position: relative;
  z-index: 1;
}

.table {
  border-radius: 16px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  height: 180px;
  cursor: pointer;
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.table:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  border-color: #2ecc71;
}

.table div {
  font-size: 1.1em;
  color: #2c3e50;
  margin: 5px 0;
}

.table div:first-child {
  font-size: 1.4em;
  font-weight: 600;
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.halls-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #e9ecef;
  padding: 0;
  box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.08);
  z-index: 2;
  border-top: 1px solid #e9ecef;
}

.halls {
  display: flex;
  justify-content: center;
  gap: 15px;
  overflow-x: auto;
  padding: 10px;
}

.hall {
  padding: 12px 24px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #000;
}

.hall:hover {
  background: linear-gradient(135deg, #e9ecef, #dee2e6);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.hall div:first-child {
  font-weight: 600;
  font-size: 1.1em;
  margin-bottom: 5px;
  color: #2c3e50;
}

.hall div:last-child {
  font-size: 0.9em;
  color: #6c757d;
}
</style>