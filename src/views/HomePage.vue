<template>
  <div>
    <div class="header">
      <h1>LIVRESSE</h1>
      <button class="search-button">
        <i class="fas fa-search"></i> 
      </button>
    </div>
    <button class="add-auction-button" @click="goToAddAuction">Adicionar Leilão</button>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  setup() {
    const router = useRouter();
    const goToAddAuction = () => {
      router.push('/add-auction');
    };

    return { goToAddAuction };
  },
});
</script>

<style src="./HomePage.css"></style>
