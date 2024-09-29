<template>
  <div class="homepage-container">
    <header class="header">
      <h1>LIVRESSE</h1>
      <span class="credits">Créditos: {{ credits }}</span>
      <div class="button-container">
        <button class="search-button" @click="toggleSearch">
          <i class="fas fa-search"></i>
        </button>
        <button v-if="isLoggedIn" class="menu-button" @click="toggleMenu">
          <i class="fas fa-bars"></i>
        </button>
      </div>
      <input
        v-if="searchActive"
        v-model="searchQuery"
        type="text"
        placeholder="Digite o nome do livro"
        class="search-input"
      />
    </header>
    <button class="login-button" @click="loginModalVisible = true">Login</button>
    <LoginModal v-model="loginModalVisible" />
    <div v-if="creditModalActive" class="modal">
      <div class="modal-content">
        <h2>Adicionar Créditos</h2>
        <input type="number" v-model.number="newCredits" placeholder="Quantidade de créditos" min="1" />
        <button @click="addCredits">Adicionar</button>
        <button @click="toggleCreditModal">Fechar</button>
      </div>
    </div>
    
    <div v-if="addAuctionModalActive" class="modal">
      <div class="modal-content">
        <h2>Adicionar Leilão</h2>
        <form @submit.prevent="submitAuction">
          <div class="form-group">
            <label for="name_book">Nome do Livro:</label>
            <input type="text" v-model="newAuction.name_book" id="name_book" required />
          </div>
          <div class="form-group">
            <label for="book_sinopse">Sinopse:</label>
            <textarea v-model="newAuction.book_sinopse" id="book_sinopse" required></textarea>
          </div>
          <div class="form-group">
            <label for="description_book">Detalhes:</label>
            <textarea v-model="newAuction.description_book" id="description_book" required></textarea>
          </div>
          <div class="form-group">
            <label for="price_book">Lance Mínimo:</label>
            <input type="number" v-model.number="newAuction.price_book" id="price_book" required />
          </div>
          <div class="form-group">
            <label for="photo_book">Foto do Livro:</label>
            <input type="file" @change="onFileChange" id="photo_book" />
          </div>
          <button type="submit">Adicionar Leilão</button>
          <button @click="toggleAddAuctionModal">Cancelar</button>
        </form>
      </div>
    </div>

    <div class="books-container">
      <div
        v-for="book in filteredBooks"
        :key="book.id"
        class="book-card"
        @click="openBookDetails(book)" 
      >
        <img v-if="book.photo_book" :src="book.photo_book" alt="Foto do Livro" class="book-photo" />
        <h2>{{ book.name_book }}</h2>
        <p>Lance Mínimo: R$ {{ book.price_book }}</p>
      </div>
    </div>

    <div v-if="menuActive" class="menu">
      <button @click="toggleAddAuctionModal">Adicionar Leilão</button>
      <button @click="toggleCreditModal">Adicionar Créditos</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '../stores/userStore';
import LoginModal from './LoginModal.vue';
import { useRouter } from 'vue-router';

interface Book {
  id: number;
  name_book: string;
  price_book: number;
  photo_book: string | null;
  description_book: string | null;
  book_sinopse: string | null;
}
const isLoggedIn = computed(() => !!userStore.user);
const books = ref<Book[]>([]);
const searchQuery = ref<string>('');
const searchActive = ref<boolean>(false);
const creditModalActive = ref<boolean>(false);
const addAuctionModalActive = ref<boolean>(false);
const menuActive = ref<boolean>(false);
const newAuction = ref({
  name_book: '',
  book_sinopse: '',
  description_book: '',
  price_book: null as number | null,
  photo_book: null as File | null,
});
const newCredits = ref<number>(0);
const loginModalVisible = ref<boolean>(false);
const router = useRouter();
const userStore = useUserStore();
const credits = computed(() => userStore.user?.credits || 0);
const toggleSearch = () => {
  searchActive.value = !searchActive.value;
};

const openBookDetails = (book: Book) => {
  if (!userStore.user || !userStore.token) {
    alert('Você precisa estar logado para ver os detalhes do livro e dar lances.');
    loginModalVisible.value = true; 
    return;
  }
  router.push({ name: 'BookDetails', params: { id: book.id } });
};

const toggleMenu = () => {
  menuActive.value = !menuActive.value;
};

const toggleCreditModal = () => {
  creditModalActive.value = !creditModalActive.value;
};

const toggleAddAuctionModal = () => {
  if (!userStore.user || !userStore.token) {
    alert('Você precisa estar logado para adicionar um leilão.');
    loginModalVisible.value = true; 
    return;
  }
  addAuctionModalActive.value = !addAuctionModalActive.value;
};

const addCredits = async () => {
  if (!userStore.user) {
    alert('Você precisa estar logado para adicionar créditos.');
    return;
  }

  if (newCredits.value <= 0) {
    alert('Por favor, insira um valor válido.');
    return;
  }

  try {
    await userStore.addCreditsToUser(newCredits.value);
    newCredits.value = 0;
    toggleCreditModal();
    await userStore.loadUserFromStorage(); 
    alert('Créditos adicionados com sucesso!');
  } catch (error) {
    console.error('Erro ao adicionar créditos:', error);
    alert('Ocorreu um erro ao adicionar créditos. Tente novamente.');
  }
};

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  newAuction.value.photo_book = target.files ? target.files[0] : null;
};

const submitAuction = async () => {
  if (!userStore.user) {
    alert('Você precisa estar logado para criar um leilão.');
    return;
  }

  const formData = new FormData();
  formData.append('data', JSON.stringify({
    name_book: newAuction.value.name_book,
    book_sinopse: newAuction.value.book_sinopse,
    description_book: newAuction.value.description_book,
    price_book: newAuction.value.price_book,
    user_create: userStore.user.username, 
  }));

  if (newAuction.value.photo_book) {
    formData.append('files.photo_book', newAuction.value.photo_book);
  }

  try {
    const response = await fetch('http://localhost:5555/api/books', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userStore.token}`,
      },
      body: formData,
    });
    await response.json();
    alert('Leilão criado com sucesso!');
    newAuction.value = {
      name_book: '',
      book_sinopse: '',
      description_book: '',
      price_book: null,
      photo_book: null,
    };

    toggleAddAuctionModal();
    fetchBooks();
  } catch (error) {
    console.error('Erro ao adicionar leilão:', error);
  }
};
const filteredBooks = computed(() => {
  if (!searchQuery.value) {
    return books.value;
  }
  return books.value.filter((book) =>
    book.name_book.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});
//Carregar os livros
const fetchBooks = async () => {
  try {
    const response = await fetch('http://localhost:5555/api/books?populate=*');
    const data = await response.json();
    const baseUrl = 'http://localhost:5555';

    books.value = data.data.map((book: any) => {
      const photoUrl =
        book.attributes.photo_book?.data?.attributes?.formats?.small?.url ||
        book.attributes.photo_book?.data?.attributes?.url;

      return {
        id: book.id,
        name_book: book.attributes.name_book,
        price_book: book.attributes.price_book,
        photo_book: photoUrl ? `${baseUrl}${photoUrl}` : null,
        description_book: book.attributes.description_book,
        book_sinopse: book.attributes.book_sinopse,
        user_create: book.attributes.user_create,
      };
    });
  } catch (error) {
    console.error('Erro ao buscar livros:', error);
  }
};

onMounted(async () => {
  await userStore.loadUserFromStorage(); 
  await fetchBooks();
});
</script>

<style src="@/styles/HomePage.css"></style>
<style src="@/styles/ModalAddAuction.css"></style>
