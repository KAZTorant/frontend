<template>
    <div class="success-popup" v-if="successMessage">
      <p>{{ successMessage }}</p>
      <button @click="closeSuccess">Close</button>
    </div>
  </template>
  
  <script>
  export default {
    props: {
        successMessage: String
    },
    methods: {
        closeSuccess() {
        this.$emit('close');
      },
      autoClose() {
        setTimeout(() => {
          this.closeSuccess();
        }, 3000); // 3000 milliseconds = 3 seconds
      }
    },
    mounted() {
      this.autoClose(); // Automatically close the error popup after 3 seconds
    }
  }
  </script>
  
  <style scoped>
  .success-popup {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: lightgreen;
    padding: 10px;
    border: 1px solid green;
    border-radius: 4px;
    z-index: 1000;
  }
  </style>
  