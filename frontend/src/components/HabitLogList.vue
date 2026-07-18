<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ logs: { id: string; date: string }[] }>()
const emit = defineEmits<{ remove: [id: string] }>()

const logsCount = computed(() => props.logs.length)
</script>
<template>
  <p>Всего отметок: {{ logsCount }}</p>
  <ul>
    <li v-for="log in logs" :key="log.id">
      {{ log.date }}
      <button @click="emit('remove', log.id)">Удалить</button>
    </li>
  </ul>
</template>
