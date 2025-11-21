<script setup lang="ts">
import type { MirrorMode } from '~/stores/drawing'

interface Props {
  show: boolean
  mode: MirrorMode
}

defineProps<Props>()
</script>

<template>
  <template v-if="show && mode !== 'none'">
    <div
      v-if="mode === 'horizontal' || mode === 'both'"
      class="absolute w-0.5 bg-gray-300 dark:bg-gray-500 opacity-30 dark:opacity-40"
      style="left: 50%; top: -20px; height: calc(100% + 40px)"
    ></div>
    <div
      v-if="mode === 'vertical' || mode === 'both'"
      class="absolute h-0.5 bg-gray-300 dark:bg-gray-500 opacity-30 dark:opacity-40"
      style="top: 50%; left: -20px; width: calc(100% + 40px)"
    ></div>
  </template>
</template>
