<template>
  <div class="login-modal-overlay" v-if="isLoginModalVisible">
    <div class="login-modal-content">
      <button class="close-button" @click="closeModals">X</button>
      <h2>Login</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">E-mail:</label>
          <input type="email" id="email" v-model="email" required />
        </div>
        <div class="form-group">
          <label for="password">Senha:</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <button type="submit">Entrar</button>
      </form>
      <p class="register-link">
        Não possui registro? <a href="#" @click="toggleModals">Se registre aqui</a>
      </p>
    </div>
  </div>
  <div class="register-modal-overlay" v-if="isRegisterModalVisible">
    <div class="register-modal-content">
      <button class="close-button" @click="closeModals">X</button>
      <h2>Registrar</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="register-username">Usuário:</label>
          <input type="text" id="register-username" v-model="registerUsername" required />
          <small v-if="registerUsername.length < 3">O nome de usuário deve ter pelo menos 3 caracteres</small>
        </div>
        <div class="form-group">
          <label for="register-email">E-mail:</label>
          <input type="email" id="register-email" v-model="registerEmail" required />
          <small v-if="registerEmail.length < 6">O e-mail deve ter pelo menos 6 caracteres</small>
        </div>
        <div class="form-group">
          <label for="register-password">Senha:</label>
          <input type="password" id="register-password" v-model="registerPassword" required />
          <small v-if="registerPassword.length < 6">A senha deve ter pelo menos 6 caracteres</small>
        </div>
        <div class="form-group">
          <label for="confirm-password">Confirmar Senha:</label>
          <input type="password" id="confirm-password" v-model="confirmPassword" required />
          <small v-if="confirmPassword !== registerPassword">As senhas não correspondem</small>
        </div>
        <button type="submit">Registrar</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineEmits, defineProps, watch } from 'vue';
import { useUserStore } from '../stores/userStore';

const props = defineProps({
  modelValue: Boolean, 
});
const emit = defineEmits(['update:modelValue']); 

const userStore = useUserStore();


const isLoginModalVisible = ref(props.modelValue);
const isRegisterModalVisible = ref(false);

const email = ref('');
const password = ref('');
const registerUsername = ref('');
const registerEmail = ref('');
const registerPassword = ref('');
const confirmPassword = ref('');

watch(() => props.modelValue, (newValue) => {
  isLoginModalVisible.value = newValue;
});


const toggleModals = () => {
  isLoginModalVisible.value = !isLoginModalVisible.value;
  isRegisterModalVisible.value = !isRegisterModalVisible.value;
  emit('update:modelValue', isLoginModalVisible.value); 
};

// Função de login
const handleLogin = async () => {
  if (email.value && password.value) {
    try {
      const response = await fetch('http://localhost:5555/api/auth/local', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: email.value,
          password: password.value,
        }),
      });

      const data = await response.json();
      if (data.jwt) {
        userStore.setUser(data.user, data.jwt);
        await userStore.loadUserFromStorage();
        closeModals(); 
      } else {
        alert('Credenciais inválidas');
      }
    } catch (error) {
      console.error('Erro de login:', error);
    }
  } else {
    alert('Preencha os campos corretamente.');
  }
};

// Função de registro
const handleRegister = async () => {
  if (registerUsername.value.length < 3) {
    alert('O nome de usuário deve ter pelo menos 3 caracteres.');
    return;
  }
  if (registerEmail.value.length < 6) {
    alert('O e-mail deve ter pelo menos 6 caracteres.');
    return;
  }
  if (registerPassword.value.length < 6) {
    alert('A senha deve ter pelo menos 6 caracteres.');
    return;
  }
  if (registerPassword.value !== confirmPassword.value) {
    alert('As senhas não correspondem.');
    return;
  }

  try {
    const response = await fetch('http://localhost:5555/api/auth/local/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: registerUsername.value,
        email: registerEmail.value,
        password: registerPassword.value,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      alert('Registro realizado com sucesso!');
      toggleModals();
    } else {
      alert('Erro no registro: ' + (data.message || 'Erro desconhecido'));
    }
  } catch (error) {
    console.error('Erro de registro:', error);
  }
};

const closeModals = () => {
  isLoginModalVisible.value = false;
  isRegisterModalVisible.value = false;
  emit('update:modelValue', false); 
};

onMounted(() => {
  userStore.loadUserFromStorage();
});
</script>

<style src="@/styles/LoginModal.css"></style>
<style src="@/styles/RegistroModal.css"></style>
