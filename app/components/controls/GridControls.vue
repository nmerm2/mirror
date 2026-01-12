<script setup lang="ts">
import type { MirrorMode, TileGridDivisions } from '~/stores/drawing'

interface Props {
  gridSize: number
  showGrid: boolean
  snapToGrid: boolean
  mirrorMode: MirrorMode
  tileGridDivisions: TileGridDivisions
}

interface Emits {
  (e: 'update:gridSize', size: number): void
  (e: 'update:showGrid' | 'update:snapToGrid', value: boolean): void
  (e: 'update:tileGridDivisions', divisions: TileGridDivisions): void
}

const props = defineProps<Props>()
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

function updateTileGridDivisions(divisions: string) {
  emit('update:tileGridDivisions', Number(divisions) as TileGridDivisions)
}
</script>

<template>
  <div>
    <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Grid</label>
    <div class="flex flex-col gap-1">
      <!-- Canvas Grid (for mirror modes) -->
      <select
        v-if="mirrorMode !== 'mosaic'"
        :value="gridSize"
        class="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
        @change="updateGridSize(Number(($event.target as HTMLSelectElement).value))"
      >
        <option :value="25">25px</option>
        <option :value="50">50px</option>
        <option :value="100">100px</option>
        <option :value="200">200px</option>
      </select>

      <!-- Tile Grid (for mosaic mode) -->
      <select
        v-if="mirrorMode === 'mosaic'"
        :value="tileGridDivisions"
        class="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
        @change="updateTileGridDivisions(($event.target as HTMLSelectElement).value)"
      >
        <option :value="2">2×2 per tile</option>
        <option :value="4">4×4 per tile</option>
        <option :value="8">8×8 per tile</option>
        <option :value="16">16×16 per tile</option>
        <option :value="32">32×32 per tile</option>
      </select>

      <div class="flex items-center gap-2">
        <label class="flex items-center gap-1 text-xs cursor-pointer select-none text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            :checked="showGrid"
            class="cursor-pointer border-gray-300 dark:border-gray-600 focus:ring-blue-500"
            @change="updateShowGrid(($event.target as HTMLInputElement).checked)"
          >
          <span>Show</span>
        </label>
        <label class="flex items-center gap-1 text-xs cursor-pointer select-none text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            :checked="snapToGrid"
            class="cursor-pointer border-gray-300 dark:border-gray-600 focus:ring-blue-500"
            @change="updateSnapToGrid(($event.target as HTMLInputElement).checked)"
          >
          <span>Snap</span>
        </label>
      </div>
    </div>
  </div>
</template>
