import { createApp } from 'vue'
import App from './App.vue'
import store from '../../store'
import * as bootstrap from 'bootstrap'
import { createPopper } from '@popperjs/core'
window.createPopper = createPopper

window.bootstrap = bootstrap
createApp(App).use(store).mount('#app')
