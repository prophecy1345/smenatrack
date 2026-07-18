<script setup lang="ts">
import { computed } from 'vue'
import HabitCard from './HabitCard.vue'

// тип пропа расписан инлайн, как и в HabitCard.vue выше, — отдельного файла с общими типами в проекте пока нет
const props = defineProps<{
  habits: {
    id: string
    name: string
    frequency: string
    doneToday: boolean
    scheduledToday: boolean
  }[]
  // общее для всей страницы поле из корня ответа GET /habits
  isWorkdayToday: boolean
}>()
const emit = defineEmits<{ toggle: [id: string] }>()

const doneTodayCount = computed(() => props.habits.filter((h) => h.doneToday).length)
</script>
<template>
  <p>Отмечено сегодня: {{ doneTodayCount }}</p>
  <HabitCard
    v-for="habit in habits"
    :key="habit.id"
    v-bind="habit"
    :is-workday-today="isWorkdayToday"
    @toggle="emit('toggle', $event)"
  />
</template>
