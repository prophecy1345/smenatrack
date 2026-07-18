<script setup lang="ts">
defineProps<{
  id: string
  name: string
  frequency: string
  doneToday: boolean
  scheduledToday: boolean
  // тип сегодняшнего дня общий для всех карточек — приходит от списка, а не из самой привычки
  isWorkdayToday: boolean
}>()
defineEmits<{ toggle: [id: string] }>()
</script>
<template>
  <div data-habit-card>
    <input
      type="checkbox"
      :checked="doneToday"
      :disabled="doneToday || !scheduledToday"
      @change="$emit('toggle', id)"
    />
    <RouterLink :to="`/habits/${id}`">{{ name }}</RouterLink>
    <span v-if="frequency === 'workdays'">
      {{ isWorkdayToday ? 'рабочий день' : 'сегодня выходной' }}
    </span>
    <span v-else>ежедневно</span>
  </div>
</template>
