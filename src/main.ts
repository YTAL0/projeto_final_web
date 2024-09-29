import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; 
import { createPinia } from 'pinia';
import { useUserStore } from './stores/userStore'; 

const app = createApp(App);
const pinia = createPinia(); 
app.use(router).use(pinia); 
const userStore = useUserStore();
userStore.loadUserFromStorage().then(() => {
  app.mount('#app'); 
});
