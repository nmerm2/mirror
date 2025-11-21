<script setup lang="ts">
import type { DrawingTool } from '~/stores/drawing'

interface Props {
  selectedTool: DrawingTool
}

interface Emits {
  (e: 'update:selectedTool', tool: DrawingTool): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function selectTool(tool: DrawingTool) {
  emit('update:selectedTool', tool)
}
</script>

<template>
  <div>
    <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Shape</label>
    <div class="flex gap-1">
      <button
        @click="selectTool('polygon')"
        :class="[
          'flex-1',
          'px-1',
          'py-1',
          'border',
          'flex',
          'items-center',
          'justify-center',
          'transition-all',
          selectedTool === 'polygon'
            ? 'bg-blue-500 text-white border-blue-500'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600'
        ]"
        title="Polygon"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 19l7-7 3 3-7 7-3-3z" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          <path d="M2 2l7.586 7.586" />
          <circle cx="11" cy="11" r="2" />
        </svg>
      </button>
      <button
        @click="selectTool('circle')"
        :class="[
          'flex-1',
          'px-1',
          'py-1',
          'border-t',
          'border-b',
          'flex',
          'items-center',
          'justify-center',
          'transition-all',
          selectedTool === 'circle'
            ? 'bg-blue-500 text-white border-blue-500'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600'
        ]"
        title="Circle"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
        </svg>
      </button>
      <button
        @click="selectTool('square')"
        :class="[
          'flex-1',
          'px-1',
          'py-1',
          'border',
          'flex',
          'items-center',
          'justify-center',
          'transition-all',
          selectedTool === 'square'
            ? 'bg-blue-500 text-white border-blue-500'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600'
        ]"
        title="Rectangle"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
      </button>
    </div>
  </div>
</template>
