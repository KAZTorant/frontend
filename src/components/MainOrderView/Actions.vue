<template>
    <div class="actions">
      <!-- Dynamically create buttons for actions -->
      <button
        class="action-button"
        v-for="action in actions"
        :key="action.id"
        @click="performAction(action.method)"
      >
        {{ action.label }}
      </button>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Actions',
    data() {
      return {
        // Define your actions here with a label for display and a method for the action to perform
        actions: [
          { id: 1, label: 'Print', method: 'printOrder' },
          { id: 2, label: 'Combine', method: 'combineTables' },
          { id: 3, label: 'Cancel', method: 'cancelOrder' },
          { id: 4, label: 'Transfer', method: 'transferDish' },
          // ... add more actions as needed
        ]
      };
    },
    methods: {
      performAction(methodName) {
        // You would replace this with actual methods
        if (methodName === 'printOrder') {
          this.printOrder();
        } else if (methodName === 'combineTables') {
          this.combineTables();
        } else if (methodName === 'cancelOrder') {
          this.cancelOrder();
        } else if (methodName === 'transferDish') {
          this.transferDish();
        }
      },
      printOrder() {
        // Implement printing logic
      },
      combineTables() {
        // Implement combining tables logic
      },
      cancelOrder() {
        // Implement cancel order logic
      },
      transferDish() {
        // Implement transfer dish logic
      }
    }
  };
  </script>
  
  <style scoped>
  .actions {
    display: flex;
    flex-direction: column;
  }
  
  .action-button {
    /* Styling for action buttons */
    margin-bottom: 10px; /* Space between buttons */
    padding: 10px;
    background-color: #f0f0f0; /* Example color */
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .action-button:hover {
    /* Hover state for buttons */
    background-color: #e2e2e2;
  }
  </style>
  