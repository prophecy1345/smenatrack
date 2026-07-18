<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import axios from 'axios'
import api from '../api/client'

const router = useRouter()
function localDate() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

const form = reactive({
  email: '',
  password: '',
  shiftPattern: '2/2',
  shiftStartDate: localDate(),
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
})
const error = ref<string | null>(null)

async function onSubmit() {
  try {
    await api.post('/auth/register', form)
    router.push('/login')
  } catch (e) {
    // isAxiosError — типобезопасный способ добраться до ответа сервера
    error.value = axios.isAxiosError(e)
      ? (e.response?.data?.message ?? 'Не удалось зарегистрироваться')
      : 'Не удалось зарегистрироваться'
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
      <option value="1/3">сутки/трое</option>
    </select>
    <label for="shiftStartDate">Первый рабочий день текущего цикла</label>
    <input
      id="shiftStartDate"
      v-model="form.shiftStartDate"
      name="shiftStartDate"
      type="date"
      required
    />
    <p v-if="error">{{ error }}</p>
    <button type="submit">Зарегистрироваться</button>
  </form>
  <p>Уже есть аккаунт? <RouterLink to="/login">Войти</RouterLink></p>
</template>
