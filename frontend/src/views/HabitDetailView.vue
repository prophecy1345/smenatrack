<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useHabitLogs } from '../composables/useHabitLogs';
import HabitLogList from '../components/HabitLogList.vue';

const props = defineProps<{ id: string }>();
const { logs, isLoading, error, fetchLogs, createLog, removeLog } = useHabitLogs();

const today = new Date().toISOString().slice(0, 10);
// backend не даст создать вторую отметку на ту же дату — прячем кнопку заранее,
// чтобы пользователь не упирался в ошибку 409
const doneToday = computed(() =>
  logs.value.some((l: { date: string }) => l.date === today),
);

onMounted(() => fetchLogs(props.id));

async function markToday() {
  await createLog(props.id, { date: today });
}

function onRemove(logId: string) {
  removeLog(props.id, logId); // удаляем на сервере, а не только из локального списка
}
</script>
<template>
  <h2>История отметок</h2>
  <p v-if="doneToday">Сегодня уже отмечено ✓</p>
  <button v-else @click="markToday">Отметить сегодня выполненной</button>
  <p v-if="isLoading">Загрузка...</p>
  <p v-else-if="error">{{ error }}</p>
  <HabitLogList v-else :logs="logs" @remove="onRemove" />
</template>
