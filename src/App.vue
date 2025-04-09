<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
  <RouterView /> 
</template>

<script>
import MainView from './components/MainRestorantView/MainView.vue'

export default {
  name: 'App',
  components: {
    MainView
  },
  mounted() {
    document.body.addEventListener('dblclick', this.disableZoom);
  },
  beforeUnmount() {
    document.body.removeEventListener('dblclick', this.disableZoom);
  },
  methods: {
    disableZoom(event) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

}
</script>

<style>
*{
  box-sizing: border-box;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 40px;
}
html, body {
  touch-action: pan-x pan-y;
  height: 100%;
}

</style>
