import { createApp } from 'vue';

const eventBus = createApp({});

export default {
  $on: (...args) => eventBus.config.globalProperties.$on(...args),
  $once: (...args) => eventBus.config.globalProperties.$once(...args),
  $off: (...args) => eventBus.config.globalProperties.$off(...args),
  $emit: (...args) => eventBus.config.globalProperties.$emit(...args)
}; 