<!-- App.vue -->
<template>
  <div class="waiterssName">{{roleDisplayName}}: {{waitressName}}</div>
  <div class="tableName">{{tableName}}</div>
  <div id="MainOrderView">
    <OrderItems class="column" :tableId="parseInt(tableId)" />
    <Menu class="column" :tableId="parseInt(tableId)" />
    <Actions v-if="role === ('admin' || 'restaurant') " class="column" :tableId="parseInt(tableId)"/>
  </div>
</template>

<script>
import OrderItems from './OrderItems.vue';
import Menu from './Menu.vue';
import Actions from './Actions.vue';
import backendServices from '../../backend-services/backend-services';
import store from '../../store';

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
.waiterssName, .tableName{
  size: 20px;
  background-color:bisque;
}

#MainOrderView {
  display: grid;
  grid-template-columns: 55% 30% 15%;
  height: 100vh;
  overflow: hidden;
}

/* Responsive layout for tablets */
@media (max-width: 768px) {
  #MainOrderView {
    grid-template-columns: 40% 30% 30%;
  }
}

/* Responsive layout for mobile devices */
@media (max-width: 480px) {
  #MainOrderView {
    grid-template-columns: 100%;
    grid-template-rows: auto auto auto;
  }
}

.column {
  overflow-y: auto;
}

/* Additional responsive adjustments for .column */
@media (max-width: 480px) {
  .column {
    overflow-y: visible;
    height: auto;
    /* Adjust height for mobile devices */
  }
}
</style>