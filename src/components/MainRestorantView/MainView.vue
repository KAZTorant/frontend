// MainComponent.vue
<!-- MainComponent.vue -->
<template>
  <div class="layout">
    <div v-for="table in tables" :key="table.id" :class="['table', { 'occupied': table.occupant }]">
      <div>{{ table.number }}</div>
      <div v-if="table.occupant">{{ table.occupant }}</div>
      <div v-if="table.orderSum">{{ table.orderSum }}</div>
      <div v-if="table.serviceTax">{{ table.serviceTax }}</div>
    </div>
  </div>
  <!-- Container for the fixed halls menu -->
  <div class="halls-container">
    <div class="halls">
      <div v-for="hall in halls" :key="hall.id" class="hall">
        <div>{{ hall.number }}</div>
        <div>{{ hall.tableRange }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import TableComponent from './TableComponent.vue';
import HallListComponent from './HallListComponent.vue';

export default {
  components: {
    TableComponent,
    HallListComponent
  },
  data() {
    return {
      tables: [
        {
          id: 1,
          number: 'Стол 1',
          occupant: 'Окупант: Togrul',
          orderSum: 'Сумма заказа: 12.00',
          serviceTax: 'Сервис. нал.: 0%'
        },
        {
          id: 2,
          number: 'Стол 2',
          occupant: '',
          orderSum: '',
          serviceTax: ''
        },
        // ... Add more tables as necessary
        {
          id: 11,
          number: 'Стол 11',
          occupant: 'Окупант: sadig',
          orderSum: 'Сумма заказа: 17.00',
          serviceTax: 'Сервис. нал.: 0%'
        },
        {
          id: 1,
          number: 'Стол 1',
          occupant: 'Окупант: Togrul',
          orderSum: 'Сумма заказа: 12.00',
          serviceTax: 'Сервис. нал.: 0%'
        },
        {
          id: 2,
          number: 'Стол 2',
          occupant: '',
          orderSum: '',
          serviceTax: ''
        },
        // ... Add more tables as necessary
        {
          id: 11,
          number: 'Стол 11',
          occupant: 'Окупант: sadig',
          orderSum: 'Сумма заказа: 17.00',
          serviceTax: 'Сервис. нал.: 0%'
        },{
          id: 1,
          number: 'Стол 1',
          occupant: 'Окупант: Togrul',
          orderSum: 'Сумма заказа: 12.00',
          serviceTax: 'Сервис. нал.: 0%'
        },
        {
          id: 2,
          number: 'Стол 2',
          occupant: '',
          orderSum: '',
          serviceTax: ''
        },
        // ... Add more tables as necessary
        {
          id: 11,
          number: 'Стол 11',
          occupant: 'Окупант: sadig',
          orderSum: 'Сумма заказа: 17.00',
          serviceTax: 'Сервис. нал.: 0%'
        },{
          id: 1,
          number: 'Стол 1',
          occupant: 'Окупант: Togrul',
          orderSum: 'Сумма заказа: 12.00',
          serviceTax: 'Сервис. нал.: 0%'
        },
        {
          id: 2,
          number: 'Стол 2',
          occupant: '',
          orderSum: '',
          serviceTax: ''
        },
        // ... Add more tables as necessary
        {
          id: 11,
          number: 'Стол 11',
          occupant: 'Окупант: sadig',
          orderSum: 'Сумма заказа: 17.00',
          serviceTax: 'Сервис. нал.: 0%'
        },{
          id: 1,
          number: 'Стол 1',
          occupant: 'Окупант: Togrul',
          orderSum: 'Сумма заказа: 12.00',
          serviceTax: 'Сервис. нал.: 0%'
        },
        {
          id: 2,
          number: 'Стол 2',
          occupant: '',
          orderSum: '',
          serviceTax: ''
        },
        // ... Add more tables as necessary
        {
          id: 11,
          number: 'Стол 11',
          occupant: 'Окупант: sadig',
          orderSum: 'Сумма заказа: 17.00',
          serviceTax: 'Сервис. нал.: 0%'
        },{
          id: 1,
          number: 'Стол 1',
          occupant: 'Окупант: Togrul',
          orderSum: 'Сумма заказа: 12.00',
          serviceTax: 'Сервис. нал.: 0%'
        },
        {
          id: 2,
          number: 'Стол 2',
          occupant: '',
          orderSum: '',
          serviceTax: ''
        },
        // ... Add more tables as necessary
        {
          id: 11,
          number: 'Стол 11',
          occupant: 'Окупант: sadig',
          orderSum: 'Сумма заказа: 17.00',
          serviceTax: 'Сервис. нал.: 0%'
        },{
          id: 1,
          number: 'Стол 1',
          occupant: 'Окупант: Togrul',
          orderSum: 'Сумма заказа: 12.00',
          serviceTax: 'Сервис. нал.: 0%'
        },
        {
          id: 2,
          number: 'Стол 2',
          occupant: '',
          orderSum: '',
          serviceTax: ''
        },
        // ... Add more tables as necessary
        {
          id: 11,
          number: 'Стол 11',
          occupant: 'Окупант: sadig',
          orderSum: 'Сумма заказа: 17.00',
          serviceTax: 'Сервис. нал.: 0%'
        },{
          id: 1,
          number: 'Стол 1',
          occupant: 'Окупант: Togrul',
          orderSum: 'Сумма заказа: 12.00',
          serviceTax: 'Сервис. нал.: 0%'
        },
        {
          id: 2,
          number: 'Стол 2',
          occupant: '',
          orderSum: '',
          serviceTax: ''
        },
        // ... Add more tables as necessary
        {
          id: 11,
          number: 'Стол 11',
          occupant: 'Окупант: sadig',
          orderSum: 'Сумма заказа: 17.00',
          serviceTax: 'Сервис. нал.: 0%'
        },{
          id: 1,
          number: 'Стол 1',
          occupant: 'Окупант: Togrul',
          orderSum: 'Сумма заказа: 12.00',
          serviceTax: 'Сервис. нал.: 0%'
        },
        {
          id: 2,
          number: 'Стол 2',
          occupant: '',
          orderSum: '',
          serviceTax: ''
        },
        // ... Add more tables as necessary
        {
          id: 11,
          number: 'Стол 11',
          occupant: 'Окупант: sadig',
          orderSum: 'Сумма заказа: 17.00',
          serviceTax: 'Сервис. нал.: 0%'
        },{
          id: 1,
          number: 'Стол 1',
          occupant: 'Окупант: Togrul',
          orderSum: 'Сумма заказа: 12.00',
          serviceTax: 'Сервис. нал.: 0%'
        },
        {
          id: 2,
          number: 'Стол 2',
          occupant: '',
          orderSum: '',
          serviceTax: ''
        },
        // ... Add more tables as necessary
        {
          id: 11,
          number: 'Стол 11',
          occupant: 'Окупант: sadig',
          orderSum: 'Сумма заказа: 17.00',
          serviceTax: 'Сервис. нал.: 0%'
        },{
          id: 1,
          number: 'Стол 1',
          occupant: 'Окупант: Togrul',
          orderSum: 'Сумма заказа: 12.00',
          serviceTax: 'Сервис. нал.: 0%'
        },
        {
          id: 2,
          number: 'Стол 2',
          occupant: '',
          orderSum: '',
          serviceTax: ''
        },
        // ... Add more tables as necessary
        {
          id: 11,
          number: 'Стол 11',
          occupant: 'Окупант: sadig',
          orderSum: 'Сумма заказа: 17.00',
          serviceTax: 'Сервис. нал.: 0%'
        },
      ],
      halls: [
        {
          id: 1,
          number: 'Зал 1',
          tableRange: '1-20'
        },
        {
          id: 2,
          number: 'Зал 2',
          tableRange: '21-40'
        },
        {
          id: 3,
          number: 'Зал 3',
          tableRange: '41-42'
        },
        {
          id: 1,
          number: 'Зал 1',
          tableRange: '1-20'
        },
        {
          id: 2,
          number: 'Зал 2',
          tableRange: '21-40'
        },
        {
          id: 3,
          number: 'Зал 3',
          tableRange: '41-42'
        }, {
          id: 1,
          number: 'Зал 1',
          tableRange: '1-20'
        },
        {
          id: 2,
          number: 'Зал 2',
          tableRange: '21-40'
        },
        {
          id: 3,
          number: 'Зал 3',
          tableRange: '41-42'
        },
        {
          id: 1,
          number: 'Зал 1',
          tableRange: '1-20'
        },
        {
          id: 2,
          number: 'Зал 2',
          tableRange: '21-40'
        },
        {
          id: 3,
          number: 'Зал 3',
          tableRange: '41-42'
        }, {
          id: 1,
          number: 'Зал 1',
          tableRange: '1-20'
        },
        {
          id: 2,
          number: 'Зал 2',
          tableRange: '21-40'
        },
        {
          id: 3,
          number: 'Зал 3',
          tableRange: '41-42'
        },
        // Array of hall objects
      ]
    }
  },
  methods: {
    // Methods to manage the state
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