<script setup lang="ts">
import type { CanvasSize } from '~/stores/drawing'

interface Props {
  canvasSize: CanvasSize
}

interface Emits {
  (e: 'change', size: CanvasSize): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function handleSizeChange(size: CanvasSize) {
  emit('change', size)
}
</script>

<template>
  <div>
    <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Canvas</label>
    <div class="flex flex-col gap-1">
      <button
        :class="[
          'w-full',
          'px-2',
          'py-1',
          'text-xs',
          'border-2',
          'transition-all',
          canvasSize === 'landscape'
            ? 'bg-blue-500 text-white border-blue-500 font-bold'
            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
        ]"
        title="Landscape 4:3"
        @click="handleSizeChange('landscape')"
      >
        4:3
      </button>
      <button
        :class="[
          'w-full',
          'px-2',
          'py-1',
          'text-xs',
          'border-2',
          'transition-all',
          canvasSize === 'portrait'
            ? 'bg-blue-500 text-white border-blue-500 font-bold'
            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
        ]"
        title="Portrait 3:4"
        @click="handleSizeChange('portrait')"
      >
        3:4
      </button>
      <button
        :class="[
          'w-full',
          'px-2',
          'py-1',
          'text-xs',
          'border-2',
          'transition-all',
          canvasSize === 'square'
            ? 'bg-blue-500 text-white border-blue-500 font-bold'
            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
        ]"
        title="Square 1:1"
        @click="handleSizeChange('square')"
      >
        1:1
      </button>
    </div>
  </div>
</template>
