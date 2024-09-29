import { defineStore } from 'pinia';
import { ref } from 'vue';

interface User {
  id: number;
  username: string;
  email: string;
  credits: number | null;
  Admin: boolean; 
}

export const useUserStore = defineStore('userStore', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);

  const setUser = (userData: User, jwtToken: string) => {
    user.value = {
      ...userData,
      credits: userData.credits !== null ? userData.credits : 0,
    };
    token.value = jwtToken;
    localStorage.setItem('jwt', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
  };


  const loadUserFromStorage = async () => {
    const storedToken = localStorage.getItem('jwt');
    if (storedToken) {
      token.value = storedToken;
      try {
        const response = await fetch('http://localhost:1337/api/users/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          user.value = {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            credits: userData.credits !== null ? userData.credits : 0,
            Admin: userData.Admin || false, 
          };
        } else {
          console.error('Erro ao carregar os dados do usuário:', response.statusText);
          logout(); 
        }
      } catch (error) {
        console.error('Erro ao carregar os dados do usuário:', error);
        logout(); 
      }
    } else {
      logout(); 
    }
  };

  const deductCredits = async (credits: number) => {
    if (user.value && token.value) {
      try {
        const response = await fetch(`http://localhost:1337/api/users/${user.value.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.value}`,
          },
          body: JSON.stringify({
            credits: Math.max((user.value.credits || 0) - credits, 0),
          }),
        });

        if (response.ok) {
          const updatedUser = await response.json();
          user.value.credits = updatedUser.credits;
          localStorage.setItem('user', JSON.stringify(user.value));
          console.log('Créditos deduzidos:', updatedUser.credits);
        } else {
          console.error('Erro ao deduzir créditos:', response.statusText);
        }
      } catch (error) {
        console.error('Erro ao deduzir créditos:', error);
      }
    }
  };

  // Adicionar créditos ao usuário autenticado
  const addCreditsToUser = async (credits: number) => {
    if (user.value && token.value) {
      try {
        const response = await fetch(`http://localhost:1337/api/users/${user.value.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.value}`,
          },
          body: JSON.stringify({
            credits: (user.value.credits || 0) + credits,
          }),
        });

        if (response.ok) {
          const updatedUser = await response.json();
          user.value.credits = updatedUser.credits;
          localStorage.setItem('user', JSON.stringify(user.value));
          console.log('Créditos atualizados:', updatedUser.credits);
        } else {
          console.error('Erro ao adicionar créditos:', response.statusText);
          alert('Erro ao adicionar créditos. Tente novamente.');
        }
      } catch (error) {
        console.error('Erro ao adicionar créditos:', error);
        alert('Erro ao adicionar créditos. Verifique sua conexão ou tente novamente.');
      }
    } else {
      console.error('Nenhum usuário autenticado ou token ausente.');
      alert('Nenhum usuário autenticado.');
    }
  };

  return {
    user,
    token,
    setUser,
    logout,
    loadUserFromStorage,
    addCreditsToUser,
    deductCredits,
  };
});
