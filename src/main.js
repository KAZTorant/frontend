import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import './disableZoom.js';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const app = createApp(App)
app.use(store)
app.use(router)
app.mount('#app')
app.component('font-awesome-icon', FontAwesomeIcon);
