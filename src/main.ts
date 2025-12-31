import { createApp } from 'vue';
import './style.css';
import VueTheMask from 'vue-the-mask';
import App from './App.vue';
import router from './router/router.js';
import '@vueform/multiselect/themes/default.css';
import Multiselect from '@vueform/multiselect';
import VueToast from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-bootstrap.css';
import '@fortawesome/fontawesome-free/css/all.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faSpinner, faSave, faTrash, faPaperclip, faEye, faEyeSlash, faPencilAlt, faCheck, faPlusCircle, faBox, faUserPlus, faUserFriends, faSearchDollar, faBoxOpen, faKey, faSignOutAlt, faPlus, faFileExport, faSearch, faSync } from '@fortawesome/free-solid-svg-icons';
// import { inicializarBanco } from './sql/banco';
import { verificarHealth } from './tasks/health.js';
library.add(faSpinner, faSave, faTrash, faPaperclip, faEye, faEyeSlash, faPencilAlt, faCheck, faPlusCircle, faBox, faUserPlus, faUserFriends, faSearchDollar, faBoxOpen, faKey, faSignOutAlt, faPlus, faFileExport, faSearch, faSync);


(async () => {
  // await inicializarBanco();

  const app = createApp(App);

  setInterval(async () => {
    app.config.globalProperties.$apiOnline = await verificarHealth();
  }, 10 * 60 * 1000);

  app
    .use(router)
    .use(VueTheMask)
    .use(VueToast, { duration: 3000, position: 'top-right' })
    .component('Multiselect', Multiselect)
    .component("font-awesome-icon", FontAwesomeIcon);

  app.mount('#app');
})();
