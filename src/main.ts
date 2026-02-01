import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Quasar, Notify, Loading, LocalStorage } from 'quasar';
import router from './router';
import App from './App.vue';

// Import Quasar css
import '@quasar/extras/roboto-font/roboto-font.css';
import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';

// Import app css
import './css/app.scss';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(Quasar, {
  plugins: {
    Notify,
    Loading,
    LocalStorage,
  },
});

app.mount('#app');
