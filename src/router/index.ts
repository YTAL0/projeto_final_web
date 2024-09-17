import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/views/HomePage.vue';
import AddAuction from '@/views/AddAuction.vue';

const routes = [
  { path: '/', name: 'HomePage', component: HomePage },
  { path: '/add-auction', name: 'AddAuction', component: AddAuction },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
