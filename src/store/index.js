// store/index.js
import { createStore } from 'vuex';
import localStoragePlugin from './localStoragePlugin';
import auth from './auth/index';

const store = createStore({
  plugins: [localStoragePlugin], // Apply the LocalStorage plugin
  modules: {
    auth
  }
});

export default store;
