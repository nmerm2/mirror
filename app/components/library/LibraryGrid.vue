<template>
  <div v-if="drawings.length === 0" class="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
    <svg class="w-24 h-24 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
    <p class="text-lg font-medium">No saved drawings yet</p>
    <p class="text-sm mt-1">Your saved drawings will appear here</p>
  </div>

  <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    <LibraryItem
      v-for="drawing in drawings"
      :key="drawing.id"
      :drawing="drawing"
      @load="$emit('load', $event)"
      @delete="$emit('delete', $event)"
      @rename="$emit('rename', $event)"
      @download="$emit('download', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { SavedDrawing } from '~/composables/useLibrary'

defineProps<{
  drawings: SavedDrawing[]
}>()

defineEmits<{
  load: [drawing: SavedDrawing]
  delete: [id: string]
  rename: [payload: { id: string; newName: string }]
  download: [drawing: SavedDrawing]
}>()
</script>
