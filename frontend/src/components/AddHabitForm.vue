<script setup lang="ts">
import { reactive } from 'vue';
import { useHabits } from '../composables/useHabits';

// событие меняется: в модуле 8 это был 'create' с самим объектом привычки (родитель
// добавлял её в мок-массив сам); теперь источник истины — backend, поэтому событие
// без payload — оно только сигнализирует «получилось», а обновляет список fetchHabits()
const emit = defineEmits<{ created: [] }>();
const { createHabit, fieldErrors } = useHabits();
const form = reactive({ name: '', frequency: 'daily' });

async function onSubmit() {
  const ok = await createHabit({ ...form });
  if (ok) {
    emit('created');
    form.name = '';
  }
}
</script>
<template>
  <form @submit.prevent="onSubmit">
    <input v-model="form.name" placeholder="Название привычки" />
    <select v-model="form.frequency">
      <option value="daily">Каждый день</option>
      <option value="workdays">Только рабочие дни</option>
    </select>
    <ul v-if="fieldErrors.length">
      <li v-for="msg in fieldErrors" :key="msg">{{ msg }}</li>
    </ul>
    <button type="submit">Добавить</button>
  </form>
</template>
