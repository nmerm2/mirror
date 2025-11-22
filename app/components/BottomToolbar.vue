<script setup lang="ts">
interface Props {
  zoom: number
}

interface Emits {
  (e: 'zoomIn' | 'zoomOut' | 'resetZoom'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <div class="w-full bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 px-4 py-1 flex items-center justify-end">
    <!-- Zoom Controls -->
    <div class="flex items-center gap-2">
      <span class="text-xs font-semibold text-gray-700 dark:text-gray-300">Zoom:</span>
      <button
        class="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
        title="Zoom Out"
        @click="emit('zoomOut')"
      >
        −
      </button>
      <div class="min-w-12 text-center text-xs text-gray-600 dark:text-gray-400 font-semibold">
        {{ zoom.toFixed(1) }}x
      </div>
      <button
        class="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
        title="Reset Zoom"
        @click="emit('resetZoom')"
      >
        Reset
      </button>
      <button
        class="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
        title="Zoom In"
        @click="emit('zoomIn')"
      >
        +
      </button>
    </div>
  </div>
</template>
