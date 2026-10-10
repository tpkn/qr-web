import { createApp } from 'vue';
import App from './app.vue';

const app = createApp(App);
app.config.globalProperties.$production = process.env.NODE_ENV === 'production';
app.mount('#app');
