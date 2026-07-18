import { ref } from 'vue'
import api from '../api/client'

export function useHabitLogs() {
  const logs = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  async function fetchLogs(habitId) {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await api.get(`/habits/${habitId}/logs`)
      logs.value = data.items ?? data
    } catch (e) {
      error.value = e.response?.data?.message ?? 'Не удалось загрузить отметки'
    } finally {
      isLoading.value = false
    }
  }

  async function createLog(habitId, dto) {
    try {
      const { data } = await api.post(`/habits/${habitId}/logs`, dto)
      logs.value.unshift(data)
      return true
    } catch (e) {
      error.value = e.response?.data?.message ?? 'Не удалось создать отметку'
      return false
    }
  }

  async function removeLog(habitId, logId) {
    try {
      await api.delete(`/habits/${habitId}/logs/${logId}`)
      logs.value = logs.value.filter((l) => l.id !== logId)
      return true
    } catch (e) {
      error.value = e.response?.data?.message ?? 'Не удалось удалить отметку'
      return false
    }
  }

  return { logs, isLoading, error, fetchLogs, createLog, removeLog }
}
