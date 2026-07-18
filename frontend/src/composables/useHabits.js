import { ref } from 'vue'
import api from '../api/client'

export function useHabits() {
  const habits = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const fieldErrors = ref([])

  async function fetchHabits() {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await api.get('/habits')
      habits.value = data.items ?? data // data.items — если backend уже отдаёт пагинацию из модуля 7
    } catch (e) {
      error.value = e.response?.data?.message ?? 'Не удалось загрузить данные'
    } finally {
      isLoading.value = false
    }
  }

  async function createHabit(dto) {
    fieldErrors.value = []
    try {
      await api.post('/habits', dto)
      return true
    } catch (e) {
      if (e.response?.status === 400) {
        const message = e.response.data.message
        fieldErrors.value = Array.isArray(message) ? message : [message]
      } else {
        fieldErrors.value = ['Не удалось создать привычку']
      }
      return false
    }
  }

  return { habits, isLoading, error, fieldErrors, fetchHabits, createHabit }
}
