<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent, onMounted, onBeforeUnmount } from 'vue';
import { useUserStore } from './stores/userStore';

export default defineComponent({
  name: 'App',
  setup() {
    const userStore = useUserStore();
    onMounted(() => {
      userStore.loadUserFromStorage();
      window.addEventListener('beforeunload', () => {
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
      });
    });

    onBeforeUnmount(() => {
      window.removeEventListener('beforeunload', () => {
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
      });
    });
  },
});
</script>
