<script setup lang="ts">
import { reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import axios from 'axios';
import api from '../api/client';

const router = useRouter();
const form = reactive({ email: '', password: '', shiftPattern: '2/2' });
const error = ref<string | null>(null);

async function onSubmit() {
  try {
    await api.post('/auth/register', form);
    router.push('/login');
  } catch (e) {
    // isAxiosError — типобезопасный способ добраться до ответа сервера
    error.value = axios.isAxiosError(e)
      ? (e.response?.data?.message ?? 'Не удалось зарегистрироваться')
      : 'Не удалось зарегистрироваться';
  }
}
</script>
<template>
  <form @submit.prevent="onSubmit">
    <input v-model="form.email" name="email" type="email" placeholder="Email" />
    <input v-model="form.password" name="password" type="password" placeholder="Пароль" />
    <select v-model="form.shiftPattern" name="shiftPattern">
      <option value="2/2">2/2</option>
      <option value="3/3">3/3</option>
      <option value="сутки/трое">сутки/трое</option>
    </select>
    <p v-if="error">{{ error }}</p>
    <button type="submit">Зарегистрироваться</button>
  </form>
  <p>Уже есть аккаунт? <RouterLink to="/login">Войти</RouterLink></p>
</template>
