<template>
    <h3>Welcome {{getUsername()}}</h3>
  
  </template>
  
  <script>
  export default {
    name: 'WelcomeVIew',
    data() {
      return {
      }
    },
    methods:{
      getUsername() {
      return this.$store.getters[`auth/GET_USERNAME`]
    }, 
    }
   
  
  
  }
  </script>