<script setup lang="ts">
interface Props {
  isDrawingPolygon: boolean
}

interface Emits {
  (e: 'cancel'): void
  (e: 'clear'): void
  (e: 'invert'): void
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
      @click="emit('cancel')"
      class="w-full px-2 py-2 bg-orange-500 text-white border border-orange-600 text-xs font-semibold hover:bg-orange-600 transition-all"
    >
      Cancel
    </button>
    <button
      @click="emit('clear')"
      class="w-full px-2 py-2 bg-red-500 text-white border border-red-600 text-xs font-semibold hover:bg-red-600 transition-all"
    >
      Clear
    </button>
    <button
      @click="emit('invert')"
      class="w-full px-2 py-2 bg-purple-500 text-white border border-purple-600 text-xs font-semibold hover:bg-purple-600 transition-all"
    >
      Invert
    </button>
    <button
      @click="emit('import')"
      class="w-full px-2 py-2 bg-blue-500 text-white border border-blue-600 text-xs font-semibold hover:bg-blue-600 transition-all"
    >
      Import
    </button>
    <button
      @click="emit('export')"
      class="w-full px-2 py-2 bg-green-500 text-white border border-green-600 text-xs font-semibold hover:bg-green-600 transition-all"
    >
      Export
    </button>
  </div>
</template>
