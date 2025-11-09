<script setup lang="ts">
interface Props {
  zoom: number
}

interface Emits {
  (e: 'zoomIn'): void
  (e: 'zoomOut'): void
  (e: 'resetZoom'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <div>
    <label class="block text-xs font-semibold text-gray-700 mb-1">Zoom</label>
    <div class="text-center text-xs text-gray-600 mb-1">{{ zoom.toFixed(1) }}x</div>
    <div class="flex gap-0.5">
      <button
        @click="emit('zoomOut')"
        class="flex-1 px-1 py-0.5 bg-gray-200 text-gray-700 border border-gray-300 text-sm font-bold hover:bg-gray-300"
        title="Zoom Out"
      >
        −
      </button>
      <button
        @click="emit('resetZoom')"
        class="flex-1 px-1 py-0.5 bg-gray-200 text-gray-700 border-t border-b border-gray-300 text-xs hover:bg-gray-300"
        title="Reset Zoom"
      >
        1x
      </button>
      <button
        @click="emit('zoomIn')"
        class="flex-1 px-1 py-0.5 bg-gray-200 text-gray-700 border border-gray-300 text-sm font-bold hover:bg-gray-300"
        title="Zoom In"
      >
        +
      </button>
    </div>
  </div>
</template>
