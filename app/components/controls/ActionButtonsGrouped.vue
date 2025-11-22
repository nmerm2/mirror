<script setup lang="ts">
interface Props {
  isDrawingPolygon: boolean
}

interface Emits {
  (e: 'cancel'): void
  (e: 'clear'): void
  (e: 'invert'): void
  (e: 'save'): void
  (e: 'library'): void
  (e: 'import'): void
  (e: 'export'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <div class="flex-1 flex flex-col justify-end">
    <!-- Cancel button (conditional, outside groups) -->
    <button
      v-if="isDrawingPolygon"
      class="w-full px-2 py-2 bg-orange-500 text-white border border-orange-600 text-xs font-semibold hover:bg-orange-600 transition-all mb-4"
      @click="emit('cancel')"
    >
      Cancel
    </button>

    <!-- File Operations Group -->
    <div class="space-y-2">
      <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
        File
      </div>
      <button
        class="w-full px-2 py-2 bg-blue-500 text-white border border-blue-600 dark:border-blue-400 text-xs font-semibold hover:bg-blue-600 transition-all"
        @click="emit('save')"
      >
        Save
      </button>
      <button
        class="w-full px-2 py-2 bg-blue-500 text-white border border-blue-600 dark:border-blue-400 text-xs font-semibold hover:bg-blue-600 transition-all"
        @click="emit('library')"
      >
        Library
      </button>
      <button
        class="w-full px-2 py-2 bg-gray-500 dark:bg-gray-600 text-white border border-gray-600 dark:border-gray-500 text-xs font-semibold hover:bg-gray-600 dark:hover:bg-gray-700 transition-all"
        @click="emit('import')"
      >
        Import
      </button>
      <button
        class="w-full px-2 py-2 bg-gray-500 dark:bg-gray-600 text-white border border-gray-600 dark:border-gray-500 text-xs font-semibold hover:bg-gray-600 dark:hover:bg-gray-700 transition-all"
        @click="emit('export')"
      >
        Export
      </button>
    </div>

    <!-- Canvas Operations Group -->
    <div class="space-y-2 mt-4">
      <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
        Canvas
      </div>
      <button
        class="w-full px-2 py-2 bg-red-500 text-white border border-red-600 dark:border-red-400 text-xs font-semibold hover:bg-red-600 transition-all"
        @click="emit('clear')"
      >
        Clear
      </button>
      <button
        class="w-full px-2 py-2 bg-gray-500 dark:bg-gray-600 text-white border border-gray-600 dark:border-gray-500 text-xs font-semibold hover:bg-gray-600 dark:hover:bg-gray-700 transition-all"
        @click="emit('invert')"
      >
        Invert
      </button>
    </div>
  </div>
</template>
