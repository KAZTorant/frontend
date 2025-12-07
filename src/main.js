// iOS 12.5.7 Safari compatibility polyfills
import 'core-js/stable'
import 'core-js/es/promise'
import 'core-js/es/object'
import 'core-js/es/array'

import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import './disableZoom.js';

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPlus, faMinus, faArrowLeft, faHourglassHalf, faCheck, faArrowRightArrowLeft, faAngleDown, faAngleUp, faCommentDots, faCommentMedical, faBackspace, faArrowUp, faXmark } from '@fortawesome/free-solid-svg-icons'

library.add(faPlus, faMinus, faArrowLeft, faHourglassHalf, faCheck, faArrowRightArrowLeft, faAngleDown, faAngleUp, faCommentDots, faCommentMedical, faBackspace, faArrowUp, faXmark)

const app = createApp(App)
app.use(store)
app.use(router)
app.mount('#app')
app.component('font-awesome-icon', FontAwesomeIcon);
