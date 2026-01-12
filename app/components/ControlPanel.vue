<script setup lang="ts">
import { useDrawingStore } from '~/stores/drawing'
import ToolSelector from './controls/ToolSelector.vue'
import ColorPicker from './controls/ColorPicker.vue'
import MirrorControls from './controls/MirrorControls.vue'
import GridControls from './controls/GridControls.vue'
import SectionLabel from './controls/SectionLabel.vue'

interface Emits {
  (e: 'cancelPolygon'): void
  (e: 'setDrawingTool', tool: typeof store.drawingTool): void
}

const store = useDrawingStore()
const emit = defineEmits<Emits>()
</script>

<template>
  <div
    class="w-32 flex-shrink-0 bg-white dark:bg-gray-900 flex flex-col overflow-y-auto controls-scrollbar transition-colors"
  >
    <!-- Tools Section -->
    <SectionLabel label="Tools" :first="true" />
    <div class="space-y-1.5">
      <ToolSelector
        :selected-tool="store.drawingTool"
        @update:selected-tool="emit('setDrawingTool', $event)"
      />
      <ColorPicker
        :selected-color="store.color"
        @update:selected-color="store.setColor($event as typeof store.color)"
      />
    </div>

    <!-- Settings Section -->
    <SectionLabel label="Settings" :first="false" />
    <div class="space-y-1.5">
      <MirrorControls
        :mirror-mode="store.mirrorMode"
        :show-mirror-lines="store.showMirrorLines"
        :mosaic-rotation="store.mosaicRotation"
        :mosaic-tile-count-x="store.mosaicTileCountX"
        :mosaic-tile-count-y="store.mosaicTileCountY"
        :show-mosaic-lines="store.showMosaicLines"
        @update:mirror-mode="store.mirrorMode = $event"
        @update:show-mirror-lines="store.showMirrorLines = $event"
        @update:mosaic-rotation="store.setMosaicRotation($event)"
        @update:mosaic-tile-count-x="store.setMosaicTileCountX($event)"
        @update:mosaic-tile-count-y="store.setMosaicTileCountY($event)"
        @update:show-mosaic-lines="store.setShowMosaicLines($event)"
      />
      <GridControls
        :grid-size="store.gridSize"
        :show-grid="store.showGrid"
        :snap-to-grid="store.snapToGrid"
        :mirror-mode="store.mirrorMode"
        :tile-grid-divisions="store.tileGridDivisions"
        @update:grid-size="store.gridSize = $event"
        @update:show-grid="store.showGrid = $event"
        @update:snap-to-grid="store.snapToGrid = $event"
        @update:tile-grid-divisions="store.setTileGridDivisions($event)"
      />
    </div>

    <!-- Cancel button (conditional, appears during polygon drawing) -->
    <div v-if="store.isDrawingPolygon" class="flex-1 flex flex-col justify-end">
      <button
        class="w-full px-2 py-1.5 bg-orange-500 text-white border border-orange-600 text-xs font-semibold hover:bg-orange-600 transition-all"
        @click="emit('cancelPolygon')"
      >
        Cancel Polygon
      </button>
    </div>
  </div>
</template>
