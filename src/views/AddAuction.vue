<template>
  <div class="container">
    <h1>Adicionar Leilão</h1>
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="name_book">Nome do Livro:</label>
        <input type="text" v-model="auction.name_book" id="name_book" required />
      </div>
      <div class="form-group">
        <label for="book_sinopse">Sinopse:</label>
        <textarea v-model="auction.book_sinopse" id="book_sinopse" required></textarea>
      </div>
      <div class="form-group">
        <label for="description_book">Detalhes:</label>
        <textarea v-model="auction.description_book" id="description_book" required></textarea>
      </div>
      <div class="form-group">
        <label for="price_book">Lance Mínimo:</label>
        <input type="number" v-model.number="auction.price_book" id="price_book" required />
      </div>
      <div class="form-group">
        <label for="photo_book">Foto do Livro:</label>
        <input type="file" @change="onFileChange" id="photo_book" />
      </div>
      <button type="submit">Adicionar Leilão</button>
    </form>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import './AddAuction.css';

export default {
  setup() {
    const auction = ref({
      name_book: '',
      book_sinopse: '',
      description_book: '',
      price_book: null as number | null,
      photo_book: null as File | null,
    });

    const onFileChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      auction.value.photo_book = target.files ? target.files[0] : null;
    };

    const submitForm = async () => {
      const formData = new FormData();

      formData.append('data', JSON.stringify({
        name_book: auction.value.name_book,
        book_sinopse: auction.value.book_sinopse,
        description_book: auction.value.description_book,
        price_book: auction.value.price_book,
      }));

      if (auction.value.photo_book) {
        formData.append('files.photo_book', auction.value.photo_book);
      }

      try {
        const response = await axios.post('http://localhost:5555/api/books', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('Livro adicionado:', response.data);
      } catch (error) {
        console.error('Erro ao adicionar livro:', error);
      }
    };

    return {
      auction,
      onFileChange,
      submitForm,
    };
  },
};
</script>

<style src="./AddAuction.css"></style>
