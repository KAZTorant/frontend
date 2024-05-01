<!-- App.vue -->
<template>
  <div id="MainOrderView">
    <OrderItems class="column" :tableId="tableId" />
    <Menu class="column" :tableId="tableId" />
    <Actions class="column" />
    {{ this.tableId }}
  </div>
</template>

<script>
import OrderItems from './OrderItems.vue';
import Menu from './Menu.vue';
import Actions from './Actions.vue';
import backendServices from '../../backend-services/backend-services';

export default {
  name: 'MainOrderView',
  components: {
    OrderItems,
    Menu,
    Actions
  },
  data() {
    return {
      tableId: null
    }
  },
  async created() {
    this.tableId = this.$route.params.id;

    // Call the API to create an order
    try {
      await backendServices.createOrder(this.tableId);
      console.log('Order created successfully for table ID:', this.tableId);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(error.response);
        console.error(`Bad Request: ${error.response.data.error}`);
        // Handle 400 Bad Request error
      } else {
        console.error('Error creating order:', error);
        // Handle other errors
      }
    }

    // Access the ID from route params
  }
}
</script>

<style>
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