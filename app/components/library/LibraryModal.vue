<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div class="bg-white dark:bg-gray-800 shadow-2xl w-[90vw] h-[90vh] max-w-7xl flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          Drawing Library
        </h2>
        <button
          class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close library"
          @click="$emit('close')"
        >
          <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <LibraryGrid
          :drawings="drawings"
          @load="$emit('load', $event)"
          @delete="$emit('delete', $event)"
          @rename="$emit('rename', $event)"
          @download="$emit('download', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SavedDrawing } from '~/composables/useLibrary'

defineProps<{
  drawings: SavedDrawing[]
}>()

defineEmits<{
  close: []
  load: [drawing: SavedDrawing]
  delete: [id: string]
  rename: [payload: { id: string; newName: string }]
  download: [drawing: SavedDrawing]
}>()

// Handle escape key
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    // Emit will be handled by parent
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>
