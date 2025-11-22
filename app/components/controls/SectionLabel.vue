<script setup lang="ts">
defineProps<{
  label: string
  first?: boolean
}>()
</script>

<template>
  <div
    :class="[
      'text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide',
      first ? 'mt-0 mb-1.5' : 'mt-3 mb-1.5'
    ]"
  >
    {{ label }}
  </div>
</template>
