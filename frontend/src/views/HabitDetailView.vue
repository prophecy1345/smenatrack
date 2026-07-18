<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useHabitLogs } from '../composables/useHabitLogs'
import HabitLogList from '../components/HabitLogList.vue'
import api from '../api/client'
import { isAxiosError } from 'axios'

const props = defineProps<{ id: string }>()
const { logs, isLoading, error, fetchLogs, createLog, removeLog } = useHabitLogs()
const habit = ref<{
  name: string
  frequency: string
  scheduledToday: boolean
  isWorkdayToday: boolean
  today: string
} | null>(null)
const habitError = ref<string | null>(null)

const today = computed(() => habit.value?.today ?? '')
// backend не даст создать вторую отметку на ту же дату — прячем кнопку заранее,
// чтобы пользователь не упирался в ошибку 409
const doneToday = computed(() => logs.value.some((l: { date: string }) => l.date === today.value))

onMounted(async () => {
  try {
    const [{ data }] = await Promise.all([api.get(`/habits/${props.id}`), fetchLogs(props.id)])
    habit.value = data
  } catch (requestError: unknown) {
    habitError.value = isAxiosError(requestError)
      ? (requestError.response?.data?.message ?? 'Не удалось загрузить привычку')
      : 'Не удалось загрузить привычку'
  }
})

async function markToday() {
  if (!today.value) return
  await createLog(props.id, { date: today.value })
}

function onRemove(logId: string) {
  removeLog(props.id, logId) // удаляем на сервере, а не только из локального списка
}
</script>
<template>
  <h2>{{ habit?.name ?? 'История отметок' }}</h2>
  <p v-if="habitError">{{ habitError }}</p>
  <p v-if="habit?.frequency === 'workdays'">
    {{ habit.isWorkdayToday ? 'Сегодня рабочий день' : 'Сегодня выходной по вашему графику' }}
  </p>
  <p v-if="doneToday">Сегодня уже отмечено ✓</p>
  <button v-else :disabled="habit === null || !habit.scheduledToday" @click="markToday">
    Отметить сегодня выполненной
  </button>
  <p v-if="isLoading">Загрузка...</p>
  <p v-else-if="error">{{ error }}</p>
  <HabitLogList v-else :logs="logs" @remove="onRemove" />
</template>
