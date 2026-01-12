<script setup lang="ts">
import { computed } from 'vue'
import type { MosaicRotation, MosaicTileCount } from '~/stores/drawing'

interface Props {
  show: boolean
  rotation: MosaicRotation
  tileCountX: MosaicTileCount
  tileCountY: MosaicTileCount
  canvasWidth: number
  canvasHeight: number
}

const props = defineProps<Props>()

// Calculate vertical tile boundary positions (as percentages)
const verticalLines = computed(() => {
  const lines: number[] = []
  for (let i = 1; i < props.tileCountX; i++) {
    lines.push((i / props.tileCountX) * 100)
  }
  return lines
})

// Calculate horizontal tile boundary positions (as percentages)
const horizontalLines = computed(() => {
  const lines: number[] = []
  for (let i = 1; i < props.tileCountY; i++) {
    lines.push((i / props.tileCountY) * 100)
  }
  return lines
})

// Calculate rotation center positions for each tile (as percentages)
const rotationCenters = computed(() => {
  if (props.rotation === 'none') return []

  const centers: Array<{ x: number; y: number }> = []
  for (let tileY = 0; tileY < props.tileCountY; tileY++) {
    for (let tileX = 0; tileX < props.tileCountX; tileX++) {
      centers.push({
        x: ((tileX + 0.5) / props.tileCountX) * 100,
        y: ((tileY + 0.5) / props.tileCountY) * 100
      })
    }
  }
  return centers
})
</script>

<template>
  <template v-if="show">
    <!-- Vertical tile boundaries -->
    <div
      v-for="(lineX, index) in verticalLines"
      :key="`v-${index}`"
      class="absolute w-0.5 bg-cyan-400 dark:bg-cyan-500 opacity-40 dark:opacity-50 pointer-events-none"
      :style="{
        left: `${lineX}%`,
        top: '-20px',
        height: 'calc(100% + 40px)'
      }"
    />

    <!-- Horizontal tile boundaries -->
    <div
      v-for="(lineY, index) in horizontalLines"
      :key="`h-${index}`"
      class="absolute h-0.5 bg-cyan-400 dark:bg-cyan-500 opacity-40 dark:opacity-50 pointer-events-none"
      :style="{
        top: `${lineY}%`,
        left: '-20px',
        width: 'calc(100% + 40px)'
      }"
    />

    <!-- Rotation centers (only when rotation is enabled) -->
    <div
      v-for="(center, index) in rotationCenters"
      :key="`c-${index}`"
      class="absolute w-2 h-2 rounded-full bg-cyan-400 dark:bg-cyan-500 opacity-50 dark:opacity-60 pointer-events-none"
      :style="{
        left: `${center.x}%`,
        top: `${center.y}%`,
        transform: 'translate(-50%, -50%)'
      }"
    />
  </template>
</template>
