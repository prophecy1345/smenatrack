<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore) // storeToRefs — обязателен для state/getters, иначе реактивность потеряется
const { logout } = authStore // actions — просто функции, их можно доставать напрямую

function onLogout() {
  logout()
  router.push('/login') // guard срабатывает только при навигации, поэтому уводим вручную
}
</script>
<template>
  <header>
    <strong><RouterLink to="/">SmenaTrack</RouterLink></strong>
    <span v-if="user">{{ user.email }}</span>
    <button v-if="user" @click="onLogout">Выйти</button>
  </header>
</template>
