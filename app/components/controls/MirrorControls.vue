<script setup lang="ts">
import type { MirrorMode, MosaicRotation, MosaicTileCount } from '~/stores/drawing'

interface Props {
  mirrorMode: MirrorMode
  showMirrorLines: boolean
  mosaicRotation: MosaicRotation
  mosaicTileCountX: MosaicTileCount
  mosaicTileCountY: MosaicTileCount
  showMosaicLines: boolean
}

interface Emits {
  (e: 'update:mirrorMode', mode: MirrorMode): void
  (e: 'update:showMirrorLines', show: boolean): void
  (e: 'update:mosaicRotation', rotation: MosaicRotation): void
  (e: 'update:mosaicTileCountX', count: MosaicTileCount): void
  (e: 'update:mosaicTileCountY', count: MosaicTileCount): void
  (e: 'update:showMosaicLines', show: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function updateMirrorMode(mode: MirrorMode) {
  emit('update:mirrorMode', mode)
}

function updateShowMirrorLines(show: boolean) {
  emit('update:showMirrorLines', show)
}

function updateMosaicRotation(rotation: string) {
  emit('update:mosaicRotation', rotation === 'none' ? 'none' : Number(rotation) as MosaicRotation)
}

function updateMosaicTileCountX(count: string) {
  emit('update:mosaicTileCountX', Number(count) as MosaicTileCount)
}

function updateMosaicTileCountY(count: string) {
  emit('update:mosaicTileCountY', Number(count) as MosaicTileCount)
}

function updateShowMosaicLines(show: boolean) {
  emit('update:showMosaicLines', show)
}
</script>

<template>
  <div>
    <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Mirror</label>
    <div class="flex flex-col gap-1">
      <select
        :value="mirrorMode"
        class="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
        @change="updateMirrorMode(($event.target as HTMLSelectElement).value as MirrorMode)"
      >
        <option value="none">None</option>
        <option value="vertical">Horiz</option>
        <option value="horizontal">Vert</option>
        <option value="both">Quad</option>
        <option value="mosaic">Mosaic</option>
      </select>

      <!-- Mirror mode controls -->
      <label v-if="mirrorMode !== 'mosaic'" class="flex items-center gap-1 text-xs cursor-pointer select-none text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          :checked="showMirrorLines"
          class="cursor-pointer border-gray-300 dark:border-gray-600 focus:ring-blue-500"
          @change="updateShowMirrorLines(($event.target as HTMLInputElement).checked)"
        >
        <span>Show Lines</span>
      </label>

      <!-- Mosaic mode controls -->
      <div v-if="mirrorMode === 'mosaic'" class="flex flex-col gap-1 mt-1">
        <div>
          <label class="block text-xs text-gray-600 dark:text-gray-400 mb-0.5">Rotation</label>
          <select
            :value="mosaicRotation"
            class="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            @change="updateMosaicRotation(($event.target as HTMLSelectElement).value)"
          >
            <option value="none">None</option>
            <option value="2">2-fold</option>
            <option value="3">3-fold</option>
            <option value="4">4-fold</option>
            <option value="6">6-fold</option>
            <option value="8">8-fold</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-1">
          <div>
            <label class="block text-xs text-gray-600 dark:text-gray-400 mb-0.5">Tiles X</label>
            <select
              :value="mosaicTileCountX"
              class="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
              @change="updateMosaicTileCountX(($event.target as HTMLSelectElement).value)"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
            </select>
          </div>

          <div>
            <label class="block text-xs text-gray-600 dark:text-gray-400 mb-0.5">Tiles Y</label>
            <select
              :value="mosaicTileCountY"
              class="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
              @change="updateMosaicTileCountY(($event.target as HTMLSelectElement).value)"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
            </select>
          </div>
        </div>

        <label class="flex items-center gap-1 text-xs cursor-pointer select-none text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            :checked="showMosaicLines"
            class="cursor-pointer border-gray-300 dark:border-gray-600 focus:ring-blue-500"
            @change="updateShowMosaicLines(($event.target as HTMLInputElement).checked)"
          >
          <span>Show Tile Lines</span>
        </label>
      </div>
    </div>
  </div>
</template>
