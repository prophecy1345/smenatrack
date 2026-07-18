<script setup lang="ts">
defineProps<{ id: string; name: string; frequency: string; doneToday: boolean }>();
defineEmits<{ toggle: [id: string] }>();
</script>
<template>
  <div data-habit-card>
    <input type="checkbox" :checked="doneToday" @change="$emit('toggle', id)" />
    <RouterLink :to="`/habits/${id}`">{{ name }}</RouterLink>
  </div>
</template>
