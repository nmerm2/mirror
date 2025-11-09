<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Point } from '~/stores/drawing'
import GridOverlay from './overlays/GridOverlay.vue'
import MirrorLinesOverlay from './overlays/MirrorLinesOverlay.vue'

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
  mirrorMode: 'none' | 'horizontal' | 'vertical' | 'both'
}

const props = defineProps<Props>()

const containerEl = ref<HTMLDivElement | null>(null)

const cursorStyle = computed(() => (props.isPanning ? 'grabbing' : 'default'))

defineExpose({
  containerEl
})
</script>

<template>
  <div class="flex-1 flex items-center justify-center min-w-0">
    <div
      ref="containerEl"
      class="relative border-4 border-gray-300 bg-gray-400 overflow-hidden"
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
        <MirrorLinesOverlay :show="showMirrorLines" :mode="mirrorMode" />
        <GridOverlay
          :show="showGrid"
          :grid-size="gridSize"
          :canvas-width="canvasWidth"
          :canvas-height="canvasHeight"
        />
      </div>

      <!-- Canvas slot -->
      <slot></slot>
    </div>
  </div>
</template>
