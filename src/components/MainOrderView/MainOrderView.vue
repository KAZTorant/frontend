<!-- App.vue -->
<template>
  <div class="logout-div">
      <div>
        <div class="tables-head">
          <div class="waiterssName">{{roleDisplayName}}: {{waitressName}}</div>
          <div class="tableName">{{tableName}}</div>
        </div>
        <button class="tables-view" @click="goToTablesView()">Masalar</button>
        <button @click="logout" class="logout-button">Çıxış</button>
        
      </div>
      <div class="logout-action">
        <Actions v-if="role === 'admin' || role === 'restaurant'" class="column" :tableId="parseInt(tableId)"/>
      </div>
  </div>
  
  
  <div id="MainOrderView">
    <OrderItems class="column" :tableId="parseInt(tableId)" />
    <Menu class="column" :tableId="parseInt(tableId)" />
  </div>
</template>

<script>
import OrderItems from './OrderItems.vue';
import Menu from './Menu.vue';
import Actions from './Actions.vue';
import backendServices from '../../backend-services/backend-services';
import store from '../../store';
import router  from '../../router'; // Import the router instance

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
          this.$store.commit(`auth/SET_ROLE`, null); // Assuming you are using username for username here
          this.$store.commit(`auth/SET_USERNAME`, null); 
          router.push(`/`);
    },
    goToTablesView(){
      router.back();
    },
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
      // Fetch waitress details from the API
      const tableResponse = await backendServices.fetchTableDetails(this.tableId);
      this.waitressName = tableResponse.waitress.name;
      this.tableName = tableResponse.number;
      this.print_check = tableResponse.print_check;
    } catch (error) {
      console.error('Error fetching waitress details:', error);
    }

    // Access the ID from route params
  }
}

</script>

<style>
.logout-div{
  display: flex;  
  justify-content: space-between;
  white-space: nowrap;
  overflow-x: auto;
}
.logout-div>div{
  display: flex;
}
.logout-action{
  display: flex;
}
.tables-head{
  height: 58px;
  background-color: bisque;
  margin: 10px;
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 4px;
}
.tables-head .waiterssName{
  margin: 0;
  padding: 0;
  padding-bottom: 5px;
}
.tableName{
  width: 300px;
  border-radius: 0 0 4px 4px;
  size: 20px;
  background-color:bisque;
}

#MainOrderView {
  display: grid;
  grid-template-columns:1fr 1fr;
  gap: 4px;
  height: 100vh;
  overflow: hidden;
}
.tables-view{
  background-color: orange;
  font-weight: bold;
  transition: all 0.3s ease-in-out
}
.tables-view:hover{
  background-color: #f7b845;
}

/* Responsive layout for tablets */
/* @media (max-width: 768px) {
  #MainOrderView {
    grid-template-columns: 1fr 1fr;
  }
} */

/* Responsive layout for mobile devices */
@media (max-width: 768px) {
  #MainOrderView {
    grid-template-columns: 100%;
    grid-template-rows: auto auto;
  }
}
</style>