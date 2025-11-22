<template>
  <div class="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
    <!-- Thumbnail -->
    <div class="relative aspect-[4/3] bg-white dark:bg-gray-800 overflow-hidden">
      <img
        :src="drawing.thumbnail"
        :alt="drawing.name"
        class="w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
        @click="$emit('load', drawing)"
      >
      <div class="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1">
        {{ formatDate(drawing.timestamp) }}
      </div>
    </div>

    <!-- Info and Actions -->
    <div class="p-4 space-y-3">
      <!-- Name (editable) -->
      <div class="flex items-center gap-2">
        <input
          v-if="isEditing"
          ref="nameInput"
          v-model="editedName"
          type="text"
          class="flex-1 px-2 py-1 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keydown.enter="saveRename"
          @keydown.escape="cancelRename"
          @blur="saveRename"
        >
        <h3
          v-else
          class="flex-1 text-sm font-medium text-gray-900 dark:text-white truncate"
          :title="drawing.name"
        >
          {{ drawing.name }}
        </h3>
        <button
          v-if="!isEditing"
          class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Rename drawing"
          @click="startRename"
        >
          <svg class="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </div>

      <!-- Action Buttons -->
      <div class="grid grid-cols-2 gap-2">
        <button
          class="px-2 py-2 text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white border border-blue-600 transition-all"
          @click="$emit('load', drawing)"
        >
          Load
        </button>
        <button
          class="px-2 py-2 text-xs font-semibold bg-green-500 hover:bg-green-600 text-white border border-green-600 transition-all"
          @click="$emit('download', drawing)"
        >
          Download
        </button>
        <button
          class="col-span-2 px-2 py-2 text-xs font-semibold bg-red-500 hover:bg-red-600 text-white border border-red-600 transition-all"
          @click="handleDelete"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SavedDrawing } from '~/composables/useLibrary'

const props = defineProps<{
  drawing: SavedDrawing
}>()

const emit = defineEmits<{
  load: [drawing: SavedDrawing]
  delete: [id: string]
  rename: [payload: { id: string; newName: string }]
  download: [drawing: SavedDrawing]
}>()

const isEditing = ref(false)
const editedName = ref('')
const nameInput = ref<HTMLInputElement | null>(null)

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

function startRename() {
  editedName.value = props.drawing.name
  isEditing.value = true
  nextTick(() => {
    nameInput.value?.focus()
    nameInput.value?.select()
  })
}

function saveRename() {
  if (isEditing.value && editedName.value.trim() !== props.drawing.name) {
    emit('rename', {
      id: props.drawing.id,
      newName: editedName.value.trim()
    })
  }
  isEditing.value = false
}

function cancelRename() {
  isEditing.value = false
  editedName.value = ''
}

function handleDelete() {
  if (window.confirm(`Delete "${props.drawing.name}"? This cannot be undone.`)) {
    emit('delete', props.drawing.id)
  }
}
</script>
