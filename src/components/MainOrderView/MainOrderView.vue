<!-- App.vue -->
<template>
  <div class="main-container">
    <div class="header-container">
      <div class="header-content">
        <div class="left-section">
          <div class="user-info">
            <div class="role-badge">{{roleDisplayName}}</div>
            <div class="user-name">{{waitressName}}</div>
          </div>
          <div class="table-info">
            <div class="table-label">Masa</div>
            <div class="table-number">{{tableName}}</div>
          </div>
        </div>
        <div class="right-section">
          <div class="action-buttons">
            <button class="action-btn tables-btn" @click="goToTablesView()">
              <font-awesome-icon icon="table" />
              <span>Masalar</span>
            </button>
            <button class="action-btn logout-btn" @click="logout">
              <font-awesome-icon icon="sign-out-alt" />
              <span>Çıxış</span>
            </button>
          </div>
        </div>
      </div>
      <div class="admin-actions" v-if="role === 'admin' || role === 'restaurant'">
        <Actions :tableId="parseInt(tableId)" />
      </div>
    </div>
    
    <div class="content-container">
      <OrderItems class="order-section" :tableId="parseInt(tableId)" />
      <Menu class="menu-section" :tableId="parseInt(tableId)" />
    </div>
  </div>
</template>

<script>
import OrderItems from './OrderItems.vue';
import Menu from './Menu.vue';
import Actions from './Actions.vue';
import backendServices from '../../backend-services/backend-services';
import store from '../../store';
import router  from '../../router';

export default {
  name: 'MainOrderView',
  components: {
    OrderItems,
    Menu,
    Actions
  },
  data() {
    return {
      tableId: null,
      role: null,
      waitressName: "",
      tableName: "",
      print_check: false,
      roleDisplayName: ""
    }
  },
  methods: {
    logout() {
      this.$store.commit(`auth/SET_AUTHENTICATION`, null);
      this.$store.commit(`auth/SET_ROLE`, null);
      this.$store.commit(`auth/SET_USERNAME`, null); 
      router.push(`/`);
    },
    goToTablesView(){
      router.back();
    }
  },
  
  async created() {
    this.tableId = this.$route.params.id;
    this.role = store.getters['auth/GET_ROLE'];

    if(this.role === "admin"){
      this.roleDisplayName = "Adminstrator";
    }else if(this.role === "waitress"){
      this.roleDisplayName = "Ofsiant";
    }else if(this.role === "restaurant"){
      this.roleDisplayName = "Restorant sahibi";
    }

    try {
      const tableResponse = await backendServices.fetchTableDetails(this.tableId);
      this.waitressName = tableResponse.waitress.name;
      this.tableName = tableResponse.number;
      this.print_check = tableResponse.print_check;
    } catch (error) {
      console.error('Error fetching waitress details:', error);
    }
  }
}
</script>

<style>
/* Keep all existing styles except modal-related ones */
.main-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 245, 245, 0.98));
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  overflow: hidden;
  position: relative;
}

.header-container {
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid #e9ecef;
  padding: 20px;
  position: relative;
  z-index: 10;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 30px;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.role-badge {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
  padding: 8px 16px;
  border-radius: 25px;
  font-size: 1.1em;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(46, 204, 113, 0.2);
}

.user-name {
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.3em;
}

.table-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.table-label {
  color: #6c757d;
  font-size: 1.1em;
}

.table-number {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
  font-size: 1.8em;
}

.action-buttons {
  display: flex;
  gap: 15px;
}

.admin-actions {
  display: flex;
  gap: 12px;
  flex-wrap: nowrap;
  justify-content: flex-start;
  margin-top: 15px;
  width: 100%;
}

.admin-actions > * {
  flex: 1;
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
  min-width: 180px;
  justify-content: center;
}

.tables-btn {
  background: linear-gradient(135deg, #ffa502, #ff7f00);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 165, 2, 0.2);
}

.tables-btn:hover {
  background: linear-gradient(135deg, #ff7f00, #ff6b00);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 165, 2, 0.3);
}

.logout-btn {
  background: linear-gradient(135deg, #ff6b6b, #ff5252);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 82, 82, 0.2);
}

.logout-btn:hover {
  background: linear-gradient(135deg, #ff5252, #ff1744);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 82, 82, 0.3);
}

.content-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  padding: 25px;
  flex: 1;
  height: calc(100vh - 220px);
  overflow: hidden;
}

.order-section, .menu-section {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 245, 245, 0.98));
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .left-section {
    flex-direction: column;
    align-items: center;
    gap: 15px;
    width: 100%;
  }

  .right-section {
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .admin-actions {
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }

  .admin-actions > * {
    flex: 0 1 auto;
  }

  .action-buttons {
    justify-content: center;
    flex-wrap: wrap;
  }

  .content-container {
    grid-template-columns: 1fr;
    height: calc(100vh - 280px);
    gap: 15px;
    padding: 15px;
    overflow-y: auto;
  }

  .order-section, .menu-section {
    min-height: 300px;
    height: auto;
  }

  .action-btn {
    min-width: 160px;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 15px 10px;
  }

  .admin-actions {
    gap: 8px;
  }

  .action-btn {
    padding: 10px 15px;
    font-size: 0.95em;
    min-width: 140px;
  }

  .content-container {
    padding: 10px;
    gap: 10px;
    height: calc(100vh - 260px);
  }
}

@media (max-width: 480px) {
  .header-container {
    padding: 10px 8px;
  }

  .admin-actions {
    gap: 6px;
  }

  .action-btn {
    padding: 8px 12px;
    font-size: 0.9em;
    min-width: 120px;
  }

  .content-container {
    padding: 8px;
    gap: 8px;
    height: calc(100vh - 240px);
  }
}

/* Add support for landscape mode */
@media (max-width: 900px) and (orientation: landscape) {
  .content-container {
    grid-template-columns: 1fr 1fr;
    height: calc(100vh - 200px);
  }

  .header-content {
    flex-direction: row;
    align-items: center;
  }

  .left-section {
    flex-direction: row;
  }

  .right-section {
    flex-direction: row;
  }

  .admin-actions {
    flex-wrap: nowrap;
    justify-content: flex-start;
  }

  .admin-actions > * {
    flex: 1;
  }
}
</style>