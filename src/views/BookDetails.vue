<template>
  <div>
    <!-- Header -->
    <header class="book-details-header">
      <h1>LIVRESSE</h1>
      <div class="user-info-container">
        <div v-if="user" class="user-info">
          <p>Créditos: {{ user.credits }}</p>
        </div>
      </div>
      <button class="close-button" @click="goBack">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-house-door" viewBox="0 0 16 16">
          <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4z"/>
        </svg>
      </button>
    </header>

    <!-- Detalhes do livro -->
    <div class="page-container" v-if="book">
      <div class="book-details-content">
        <!-- Exibição da imagem do livro -->
        <img v-if="book.photo_book && book.photo_book.data" 
             :src="`http://localhost:5555${book.photo_book.data.attributes.formats?.small?.url || book.photo_book.data.attributes.url}`" 
             alt="Foto do Livro" 
             class="book-photo" />
        
        <!-- Detalhes do livro -->
        <h2>{{ book.name_book || 'Título não disponível' }}</h2>
        <p><strong>Lance Mínimo:</strong> R$ {{ book.price_book || 'N/A' }}</p>
        <p><strong>Detalhes:</strong> {{ book.description_book || 'Descrição indisponível' }}</p>
        <p><strong>Sinopse:</strong> {{ book.book_sinopse || 'Sinopse indisponível' }}</p>
        <p><strong>Criado por:</strong> {{ book.user_create || 'Desconhecido' }}</p>

        <div v-if="!book.encerrado" class="bid-section">
          <input 
            type="number" 
            v-model.number="bidAmount" 
            :min="book.price_book" 
            placeholder="Insira seu lance"
          />
          <button @click="placeBid">Dar Lance</button>
        </div>
        <div v-if="book.encerrado">
          <h3>Leilão Encerrado</h3>
          <p v-if="winner">Vencedor: {{ winner.username }}</p>
          <p v-if="winner">Lance vencedor: R$ {{ winner.bidValue }}</p>
          <p v-else>Nenhum lance foi feito.</p>
        </div>
        <!-- Area dos lances-->
        <div class="bids-list">
          <h3>Lances</h3>
          <ul v-if="bids.length > 0">
            <li v-for="(bid, index) in bids" :key="index">
              <strong>{{ bid.attributes.users_permissions_user?.data?.attributes?.username || 'Anônimo' }}</strong> 
              Realizou um lance de R$ {{ bid.attributes.Valor }}
            </li>
          </ul>
          <p v-else>Nenhum lance disponível</p>
        </div>
        <!--Botoes so visiveis para admins-->
        <div class="button-container">
        <button v-if="isAdmin && !book.encerrado" class="end-button" @click="endAuction">
          Encerrar Leilão
        </button>
        <button v-if="isAdmin" class="delete-button" @click="deleteAuction">
          Excluir Leilão
        </button>
      </div>
      </div>
    </div>
    <div v-else class="loading">
      Carregando detalhes do livro...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore'; 

const route = useRoute();
const router = useRouter();
const book = ref<any>({}); 
const bidAmount = ref<number | null>(null); 
const bids = ref<any[]>([]); 
const userStore = useUserStore();
const user = userStore.user; 
const isAdmin = ref(false); 
const winner = ref<{ username: string; bidValue: number } | null>(null);
const checkAuthentication = () => {
  const token = userStore.token || localStorage.getItem('jwt');
  
  if (!token) {
    alert('Você precisa estar autenticado para acessar esta página.');
    router.push({ name: 'LoginPage' }); 
  }
};
const fetchBookDetails = async () => {
  const token = userStore.token || localStorage.getItem('jwt');
  try {
    const response = await fetch(`http://localhost:5555/api/books/${route.params.id}?populate=*`, {
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    });
    if (!response.ok) throw new Error('Erro ao buscar detalhes do livro');
    
    const data = await response.json();
    book.value = data.data.attributes;
  } catch (error) {
    console.error('Erro ao buscar os detalhes do livro:', error);
    alert('Erro ao buscar os detalhes do livro.');
  }
};
const fetchBookBids = async () => {
  try {
    const response = await fetch(`http://localhost:5555/api/lances?filters[book][id][$eq]=${route.params.id}&populate=users_permissions_user`);
    
    if (!response.ok) throw new Error('Erro ao buscar os lances');
    
    const data = await response.json();
    if (book.value.encerrado) {
      winner.value = {
        username: book.value.vencedor || '',
        bidValue: book.value.valorVencedor || 0,
      };
    }
    bids.value = data.data.sort((a, b) => b.attributes.Valor - a.attributes.Valor);
  } catch (error) {
    console.error('Erro ao buscar os lances:', error);
    alert('Erro ao buscar os lances.');
  }
};

// Verifica se o usuário logado é adm
const checkAdminStatus = () => {
  if (user && user.Admin) {
    isAdmin.value = true; 
  }
};

const goBack = () => {
  router.back();
};
// Função para realizar um lance
const placeBid = async () => {
  if (!bidAmount.value || bidAmount.value <= book.value.price_book) {
    alert('Valor do lance inválido. O valor deve ser maior que o lance mínimo.');
    return;
  }
  // Obtém o maior lance atual
  const highestBid = bids.value.length > 0 ? bids.value[0].attributes.Valor : book.value.price_book;
  // Verifica se o lance é maior que o maior lance atual
  if (bidAmount.value <= highestBid) {
    alert(`O lance deve ser maior que o lance atual de R$ ${highestBid}.`);
    return;
  }
  const loggedInUser = userStore.user;
  if (!loggedInUser) {
    alert('Você precisa estar logado para dar um lance.');
    return;
  }

  const userId = loggedInUser.id; 
  if (loggedInUser.credits === null || loggedInUser.credits < bidAmount.value) {
    alert('Você não tem créditos suficientes para dar este lance.');
    return;
  }
  try {
    // Subtrai os créditos do usuário
    await userStore.deductCredits(bidAmount.value);

    const response = await fetch('http://localhost:5555/api/lances', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userStore.token}`,
      },
      body: JSON.stringify({
        data: {
          Valor: bidAmount.value,
          users_permissions_user: userId,
          book: route.params.id, 
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao dar o lance.');
    }

    const data = await response.json();
    console.log('Lance criado com sucesso:', data);

    await fetchBookBids();
  } catch (error) {
    console.error('Erro ao dar lance:', error);
    alert('Erro ao dar o lance. Tente novamente.');
  }
};

// Função para excluir leilão 
const deleteAuction = async () => {
  if (isAdmin.value) {
    try {
      const response = await fetch(`http://localhost:5555/api/books/${route.params.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${userStore.token}`,
        },
      });
      
      if (!response.ok) throw new Error('Erro ao excluir o leilão');
      router.push({ name: 'Home' }); 
    } catch (error) {
      router.push({ name: 'Home' });
    }
  } else {
    alert('Você não tem permissão para excluir este leilão.');
  }
};
// Função para encontrar o vencedor 
const getWinner = () => {
  if (bids.value.length > 0) {
    const highestBid = bids.value.reduce((max, bid) => {
      return bid.attributes.Valor > max.attributes.Valor ? bid : max;
    });
    return {
      username: highestBid.attributes.users_permissions_user.data.attributes.username,
      bidValue: highestBid.attributes.Valor,
    };
  }
  return null;
};

// Função  pra encerrar o leilão e exibir quem venceu 
const endAuction = async () => {
  if (isAdmin.value) {
    try {
      const winnerResult = getWinner();
      const response = await fetch(`http://localhost:5555/api/books/${route.params.id}`, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userStore.token}`,
        },
        body: JSON.stringify({
          data: {
            encerrado: true, 
            vencedor: winnerResult ? winnerResult.username : null,  // Salvando o nome do vencedor
            valorVencedor: winnerResult ? winnerResult.bidValue : null//Salva o maior valor do lance vencedor
          },
        }),
      });

      if (!response.ok) throw new Error('Erro ao encerrar o leilão');
      book.value.encerrado = true;
      if (winnerResult) {
        winner.value = winnerResult;
      } else {
        winner.value = null;
        alert('Nenhum vencedor, nenhum lance foi feito.');
      }
    } catch (error) {
      console.error('Erro ao encerrar o leilão:', error);
      alert('Erro ao encerrar o leilão.');
    }
  } else {
    alert('Você não tem permissão para encerrar este leilão.');
  }
};


onMounted(() => {
  checkAuthentication();
  fetchBookDetails();
  fetchBookBids();
  checkAdminStatus(); 
});
</script>
<style src="@/styles/BookDetails.css"></style>
