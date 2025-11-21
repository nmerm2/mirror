<script setup lang="ts">
interface Props {
  gridSize: number
  showGrid: boolean
  snapToGrid: boolean
}

interface Emits {
  (e: 'update:gridSize', size: number): void
  (e: 'update:showGrid', show: boolean): void
  (e: 'update:snapToGrid', snap: boolean): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function updateGridSize(size: number) {
  emit('update:gridSize', size)
}

function updateShowGrid(show: boolean) {
  emit('update:showGrid', show)
}

function updateSnapToGrid(snap: boolean) {
  emit('update:snapToGrid', snap)
}
</script>

<template>
  <div>
    <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Grid</label>
    <div class="flex flex-col gap-1">
      <select
        :value="gridSize"
        @change="updateGridSize(Number(($event.target as HTMLSelectElement).value))"
        class="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
      >
        <option :value="25">25px</option>
        <option :value="50">50px</option>
        <option :value="100">100px</option>
        <option :value="200">200px</option>
      </select>
      <label class="flex items-center gap-1 text-xs cursor-pointer select-none text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          :checked="showGrid"
          @change="updateShowGrid(($event.target as HTMLInputElement).checked)"
          class="cursor-pointer border-gray-300 dark:border-gray-600 focus:ring-blue-500"
        />
        <span>Show</span>
      </label>
      <label class="flex items-center gap-1 text-xs cursor-pointer select-none text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          :checked="snapToGrid"
          @change="updateSnapToGrid(($event.target as HTMLInputElement).checked)"
          class="cursor-pointer border-gray-300 dark:border-gray-600 focus:ring-blue-500"
        />
        <span>Snap</span>
      </label>
    </div>
  </div>
</template>
