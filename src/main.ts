import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // se você estiver usando o Vue Router
import { createPinia } from 'pinia';
import { useUserStore } from './stores/userStore'; // Importa sua store de usuário

const app = createApp(App);
const pinia = createPinia(); // Cria uma instância do Pinia

app.use(router).use(pinia); // Usa Pinia e o Vue Router

// Antes de montar a aplicação, garante que o estado do usuário seja carregado
const userStore = useUserStore();
userStore.loadUserFromStorage().then(() => {
  app.mount('#app'); // Só monta a aplicação após carregar o usuário
});
