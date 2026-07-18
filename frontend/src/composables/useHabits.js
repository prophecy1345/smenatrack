import { ref } from 'vue'
import api from '../api/client'

export function useHabits() {
  const habits = ref([])
  // today и isWorkdayToday лежат в корне ответа: это свойства пользователя, а не привычки
  const today = ref('')
  const isWorkdayToday = ref(false)
  const isLoading = ref(false)
  const error = ref(null)
  const fieldErrors = ref([])

  async function fetchHabits() {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await api.get('/habits')
      habits.value = data.items ?? data // data.items — если backend уже отдаёт пагинацию из модуля 7
      today.value = data.today ?? ''
      isWorkdayToday.value = data.isWorkdayToday ?? false
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

  // отметка прямо из списка: дату берём серверную, чтобы на границе суток
  // браузер и backend не выбрали разные дни. Снять отметку отсюда нельзя —
  // для этого есть удаление записи на экране деталей, поэтому чекбокс уже
  // отмеченной привычки заблокирован, а эта проверка страхует от гонки
  async function toggleHabit(habitId) {
    const habit = habits.value.find((h) => h.id === habitId)
    if (!habit || habit.doneToday || !today.value) return false
    error.value = null
    try {
      await api.post(`/habits/${habitId}/logs`, { date: today.value })
      await fetchHabits()
      return true
    } catch (e) {
      error.value = e.response?.data?.message ?? 'Не удалось отметить привычку'
      return false
    }
  }

  return {
    habits,
    today,
    isWorkdayToday,
    isLoading,
    error,
    fieldErrors,
    fetchHabits,
    createHabit,
    toggleHabit,
  }
}
