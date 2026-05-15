import { createApp } from 'vue';
import App from './App.vue';
import './styles/main.css';
import { initAnalytics } from './analytics/useAnalytics';
void initAnalytics();
createApp(App).mount('#app');
