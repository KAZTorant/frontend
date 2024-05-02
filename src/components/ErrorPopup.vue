<template>
    <div class="error-popup" v-if="errorMessage">
      <p>{{ errorMessage }}</p>
      <button @click="closeError">Close</button>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      errorMessage: String
    },
    methods: {
      closeError() {
        this.$emit('close');
      },
      autoClose() {
        setTimeout(() => {
          this.closeError();
        }, 3000); // 3000 milliseconds = 3 seconds
      }
    },
    mounted() {
      this.autoClose(); // Automatically close the error popup after 3 seconds
    }
  }
  </script>
  
  <style scoped>
  .error-popup {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #ffcccc;
    padding: 10px;
    border: 1px solid #ff0000;
    border-radius: 4px;
    z-index: 1000;
  }
  </style>
  