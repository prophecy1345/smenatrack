<script setup lang="ts">
import { onMounted } from 'vue';
import { useHabits } from '../composables/useHabits';
import HabitList from '../components/HabitList.vue';
import AddHabitForm from '../components/AddHabitForm.vue';

const { habits, isLoading, error, fetchHabits } = useHabits();

onMounted(fetchHabits); // запрос уходит один раз, когда компонент появляется на экране
</script>
<template>
  <p v-if="isLoading">Загрузка...</p>
  <p v-else-if="error">{{ error }} <button @click="fetchHabits">Повторить</button></p>
  <p v-else-if="!habits.length">Пока привычек нет — добавьте первую ниже.</p>
  <!-- обработчик @toggle не входит в задания курса — событие из модуля 8 остаётся иллюстрацией пропсов/событий,
       настоящая отметка «выполнено» делается через HabitDetailView и POST /habits/:id/logs ниже -->
  <HabitList v-else :habits="habits" />
  <AddHabitForm @created="fetchHabits" />
</template>
