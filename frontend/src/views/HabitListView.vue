<script setup lang="ts">
import { onMounted } from 'vue'
import { useHabits } from '../composables/useHabits'
import HabitList from '../components/HabitList.vue'
import AddHabitForm from '../components/AddHabitForm.vue'
import ShiftSettings from '../components/ShiftSettings.vue'

const { habits, isWorkdayToday, isLoading, error, fetchHabits, toggleHabit } = useHabits()

onMounted(fetchHabits) // запрос уходит один раз, когда компонент появляется на экране
</script>
<template>
  <ShiftSettings @updated="fetchHabits" />
  <p v-if="isLoading">Загрузка...</p>
  <p v-else-if="error">{{ error }} <button @click="fetchHabits">Повторить</button></p>
  <p v-else-if="!habits.length">Пока привычек нет — добавьте первую ниже.</p>
  <!-- @toggle отмечает привычку выполненной на серверную дату today; чекбокс рабочей
       привычки заблокирован в выходной цикла, backend проверяет это независимо -->
  <HabitList v-else :habits="habits" :is-workday-today="isWorkdayToday" @toggle="toggleHabit" />
  <AddHabitForm @created="fetchHabits" />
</template>
