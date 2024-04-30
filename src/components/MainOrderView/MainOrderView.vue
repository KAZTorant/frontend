<!-- App.vue -->
<template>
    <div id="MainOrderView">
      <OrderItems class="column" />
      <Menu class="column" />
      <Actions class="column" />
    </div>
  </template>
  
  <script>
  import OrderItems from './OrderItems.vue';
  import Menu from './Menu.vue';
  import Actions from './Actions.vue';
  
  export default {
    name: 'MainOrderView',
    components: {
      OrderItems,
      Menu,
      Actions
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
      height: auto; /* Adjust height for mobile devices */
    }
  }
  </style>
  