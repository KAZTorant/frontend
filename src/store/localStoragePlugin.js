// localStoragePlugin.js

const localStoragePlugin = store => {
    // This ensures that the store is initialized with the state from LocalStorage
    if (localStorage.getItem('vuex')) {
      store.replaceState(
        Object.assign({}, store.state, JSON.parse(localStorage.getItem('vuex')))
      );
    }
  
    // Subscribe to mutation events
    store.subscribe((mutation, state) => {
      // Update LocalStorage with the new state after every mutation
      localStorage.setItem('vuex', JSON.stringify(state));
    });
  };
  
  export default localStoragePlugin;
  