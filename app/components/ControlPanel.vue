<script setup lang="ts">
import { useDrawingStore } from '~/stores/drawing'
import ToolSelector from './controls/ToolSelector.vue'
import ColorPicker from './controls/ColorPicker.vue'
import MirrorControls from './controls/MirrorControls.vue'
import GridControls from './controls/GridControls.vue'
import CanvasSizeSelector from './controls/CanvasSizeSelector.vue'
import ZoomControls from './controls/ZoomControls.vue'
import ActionButtons from './controls/ActionButtons.vue'

interface Emits {
  (e: 'cancelPolygon'): void
  (e: 'clearCanvas'): void
  (e: 'importPNG'): void
  (e: 'exportPNG'): void
  (e: 'canvasSizeChange', size: typeof store.canvasSize): void
  (e: 'setDrawingTool', tool: typeof store.drawingTool): void
  (e: 'zoomIn'): void
  (e: 'zoomOut'): void
  (e: 'resetZoom'): void
}

const store = useDrawingStore()
const emit = defineEmits<Emits>()
</script>

<template>
  <div class="flex-shrink-0 bg-white flex flex-col gap-2 overflow-y-auto controls-scrollbar">
    <ToolSelector
      :selected-tool="store.drawingTool"
      @update:selected-tool="emit('setDrawingTool', $event)"
    />

    <ColorPicker
      :selected-color="store.color"
      @update:selected-color="store.setColor($event as typeof store.color)"
    />

    <MirrorControls
      :mirror-mode="store.mirrorMode"
      :show-mirror-lines="store.showMirrorLines"
      @update:mirror-mode="store.mirrorMode = $event"
      @update:show-mirror-lines="store.showMirrorLines = $event"
    />

    <GridControls
      :grid-size="store.gridSize"
      :show-grid="store.showGrid"
      :snap-to-grid="store.snapToGrid"
      @update:grid-size="store.gridSize = $event"
      @update:show-grid="store.showGrid = $event"
      @update:snap-to-grid="store.snapToGrid = $event"
    />

    <CanvasSizeSelector
      :canvas-size="store.canvasSize"
      @change="emit('canvasSizeChange', $event)"
    />

    <ZoomControls
      :zoom="store.zoom"
      @zoom-in="emit('zoomIn')"
      @zoom-out="emit('zoomOut')"
      @reset-zoom="emit('resetZoom')"
    />

    <ActionButtons
      :is-drawing-polygon="store.isDrawingPolygon"
      @cancel="emit('cancelPolygon')"
      @clear="emit('clearCanvas')"
      @import="emit('importPNG')"
      @export="emit('exportPNG')"
    />
  </div>
</template>
