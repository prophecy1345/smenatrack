<script setup lang="ts">
import { reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import api from '../api/client'
import { useAuthStore } from '../stores/auth'

// график задаётся при регистрации, но меняется: смена работы, сдвиг цикла, переезд.
// Без этого экрана поправить его можно было бы только в базе.
const emit = defineEmits<{ updated: [] }>()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const { setUser } = authStore

const form = reactive({
  shiftPattern: user.value?.shiftPattern ?? '2/2',
  shiftStartDate: user.value?.shiftStartDate ?? '',
  // отдельного поля нет: при сохранении подхватываем текущий пояс браузера — это и есть
  // ответ на переезд, а вручную вводить IANA-имя вроде Europe/Belgrade никто не станет
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
})
const error = ref<string | null>(null)
const saved = ref(false)

async function onSubmit() {
  error.value = null
  saved.value = false
  try {
    const { data } = await api.patch('/auth/me', form)
    setUser(data)
    saved.value = true
    emit('updated') // список привычек пересчитывает рабочий день по новому графику
  } catch (e) {
    const message = axios.isAxiosError(e) ? e.response?.data?.message : null
    error.value = Array.isArray(message) ? message.join(', ') : (message ?? 'Не удалось сохранить')
  }
}
</script>
<template>
  <form @submit.prevent="onSubmit">
    <h3>Мой график</h3>
    <select v-model="form.shiftPattern" name="shiftPattern">
      <option value="2/2">2/2</option>
      <option value="3/3">3/3</option>
      <option value="1/3">сутки/трое</option>
    </select>
    <label for="settingsShiftStartDate">Первый рабочий день цикла</label>
    <input
      id="settingsShiftStartDate"
      v-model="form.shiftStartDate"
      name="shiftStartDate"
      type="date"
      required
    />
    <p>Часовой пояс: {{ form.timeZone }}</p>
    <p v-if="error">{{ error }}</p>
    <p v-else-if="saved">График сохранён</p>
    <button type="submit">Сохранить график</button>
  </form>
</template>
