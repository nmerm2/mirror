<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Point, MirrorMode, MosaicRotation, MosaicTileCount, TileGridDivisions } from '~/stores/drawing'
import GridOverlay from './overlays/GridOverlay.vue'
import MirrorLinesOverlay from './overlays/MirrorLinesOverlay.vue'
import MosaicLinesOverlay from './overlays/MosaicLinesOverlay.vue'

interface Props {
  aspectRatio: string
  zoom: number
  panOffset: Point
  isPanning: boolean
  showGrid: boolean
  gridSize: number
  canvasWidth: number
  canvasHeight: number
  showMirrorLines: boolean
  mirrorMode: MirrorMode
  mosaicRotation: MosaicRotation
  mosaicTileCountX: MosaicTileCount
  mosaicTileCountY: MosaicTileCount
  showMosaicLines: boolean
  tileGridDivisions: TileGridDivisions
}

const props = defineProps<Props>()

const containerEl = ref<HTMLDivElement | null>(null)

const cursorStyle = computed(() => {
  if (props.isPanning) return 'grabbing'
  return 'crosshair'
})

defineExpose({
  containerEl
})
</script>

<template>
  <div class="flex-1 flex items-center justify-center min-w-0">
    <div
      ref="containerEl"
      class="relative border-4 border-gray-300 dark:border-gray-600 bg-gray-400 dark:bg-gray-700 overflow-hidden transition-colors"
      :style="{
        cursor: cursorStyle,
        maxWidth: '100%',
        maxHeight: '100%',
        aspectRatio: aspectRatio
      }"
    >
      <!-- Wrapper for grid and mirror lines -->
      <div
        class="absolute top-0 left-0 pointer-events-none z-10"
        :style="{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          width: '100%',
          height: '100%',
          overflow: 'visible'
        }"
      >
        <MirrorLinesOverlay :show="showMirrorLines && mirrorMode !== 'mosaic'" :mode="mirrorMode" />
        <MosaicLinesOverlay
          :show="showMosaicLines && mirrorMode === 'mosaic'"
          :rotation="mosaicRotation"
          :tile-count-x="mosaicTileCountX"
          :tile-count-y="mosaicTileCountY"
          :canvas-width="canvasWidth"
          :canvas-height="canvasHeight"
        />
        <GridOverlay
          :show="showGrid"
          :grid-size="gridSize"
          :canvas-width="canvasWidth"
          :canvas-height="canvasHeight"
          :mirror-mode="mirrorMode"
          :mosaic-tile-count-x="mosaicTileCountX"
          :mosaic-tile-count-y="mosaicTileCountY"
          :tile-grid-divisions="tileGridDivisions"
        />
      </div>

      <!-- Canvas slot -->
      <slot/>
    </div>
  </div>
</template>
