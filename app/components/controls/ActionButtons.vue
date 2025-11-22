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
  <div class="flex-1 flex flex-col justify-end gap-2 mt-4">
    <button
      v-if="isDrawingPolygon"
      class="w-full px-2 py-2 bg-orange-500 text-white border border-orange-600 text-xs font-semibold hover:bg-orange-600 transition-all"
      @click="emit('cancel')"
    >
      Cancel
    </button>
    <button
      class="w-full px-2 py-2 bg-red-500 text-white border border-red-600 text-xs font-semibold hover:bg-red-600 transition-all"
      @click="emit('clear')"
    >
      Clear
    </button>
    <button
      class="w-full px-2 py-2 bg-purple-500 text-white border border-purple-600 text-xs font-semibold hover:bg-purple-600 transition-all"
      @click="emit('invert')"
    >
      Invert
    </button>
    <button
      class="w-full px-2 py-2 bg-indigo-500 text-white border border-indigo-600 text-xs font-semibold hover:bg-indigo-600 transition-all"
      @click="emit('save')"
    >
      Save
    </button>
    <button
      class="w-full px-2 py-2 bg-cyan-500 text-white border border-cyan-600 text-xs font-semibold hover:bg-cyan-600 transition-all"
      @click="emit('library')"
    >
      Library
    </button>
    <button
      class="w-full px-2 py-2 bg-blue-500 text-white border border-blue-600 text-xs font-semibold hover:bg-blue-600 transition-all"
      @click="emit('import')"
    >
      Import
    </button>
    <button
      class="w-full px-2 py-2 bg-green-500 text-white border border-green-600 text-xs font-semibold hover:bg-green-600 transition-all"
      @click="emit('export')"
    >
      Export
    </button>
  </div>
</template>
