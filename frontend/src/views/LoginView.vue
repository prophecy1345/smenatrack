<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../api/client'

const router = useRouter()
const { setAuth } = useAuthStore()
const form = reactive({ email: '', password: '' })
const error = ref<string | null>(null)

async function onSubmit() {
  try {
    const { data } = await api.post('/auth/login', form)
    const { data: me } = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${data.accessToken}` },
    })
    setAuth(me, data.accessToken)
    router.push('/')
  } catch {
    error.value = 'Неверный email или пароль'
  }
}
</script>
<template>
  <form @submit.prevent="onSubmit">
    <input v-model="form.email" name="email" type="email" placeholder="Email" />
    <input v-model="form.password" name="password" type="password" placeholder="Пароль" />
    <p v-if="error">{{ error }}</p>
    <button type="submit">Войти</button>
  </form>
  <p>Нет аккаунта? <RouterLink to="/register">Зарегистрироваться</RouterLink></p>
</template>
