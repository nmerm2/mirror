<script setup lang="ts">
import { computed } from 'vue'
import type { MirrorMode, MosaicTileCount, TileGridDivisions } from '~/stores/drawing'

interface Props {
  show: boolean
  gridSize: number
  canvasWidth: number
  canvasHeight: number
  mirrorMode: MirrorMode
  mosaicTileCountX: MosaicTileCount
  mosaicTileCountY: MosaicTileCount
  tileGridDivisions: TileGridDivisions
}

const props = defineProps<Props>()

const gridLines = computed(() => {
  if (!props.show) return []

  const lines: Array<{ key: string; isMajor: boolean; style: Record<string, string> }> = []
  const extension = 20

  if (props.mirrorMode === 'mosaic') {
    // Tile Grid Mode: Calculate grid based on tile divisions
    const tileWidth = props.canvasWidth / props.mosaicTileCountX
    const tileHeight = props.canvasHeight / props.mosaicTileCountY

    // Use the smaller dimension to ensure square cells
    const baseCellSize = Math.min(tileWidth, tileHeight) / props.tileGridDivisions

    // Vertical lines
    for (let x = 0; x <= props.canvasWidth; x += baseCellSize) {
      // Check if this is a tile boundary (more prominent)
      const isTileBoundary = Math.abs(x % tileWidth) < 0.1
      const percentX = (x / props.canvasWidth) * 100
      lines.push({
        key: `v-${x}`,
        isMajor: isTileBoundary,
        style: {
          position: 'absolute',
          left: `${percentX}%`,
          top: `-${extension}px`,
          width: isTileBoundary ? '1.5px' : '0.5px',
          height: `calc(100% + ${extension * 2}px)`,
        }
      })
    }

    // Horizontal lines
    for (let y = 0; y <= props.canvasHeight; y += baseCellSize) {
      // Check if this is a tile boundary (more prominent)
      const isTileBoundary = Math.abs(y % tileHeight) < 0.1
      const percentY = (y / props.canvasHeight) * 100
      lines.push({
        key: `h-${y}`,
        isMajor: isTileBoundary,
        style: {
          position: 'absolute',
          top: `${percentY}%`,
          left: `-${extension}px`,
          height: isTileBoundary ? '1.5px' : '0.5px',
          width: `calc(100% + ${extension * 2}px)`,
        }
      })
    }
  } else {
    // Canvas Grid Mode: Absolute pixel divisions
    const majorInterval = 200

    // Vertical lines
    for (let x = 0; x <= props.canvasWidth; x += props.gridSize) {
      const isMajor = x % majorInterval === 0
      const percentX = (x / props.canvasWidth) * 100
      lines.push({
        key: `v-${x}`,
        isMajor,
        style: {
          position: 'absolute',
          left: `${percentX}%`,
          top: `-${extension}px`,
          width: isMajor ? '1.5px' : '0.5px',
          height: `calc(100% + ${extension * 2}px)`,
        }
      })
    }

    // Horizontal lines
    for (let y = 0; y <= props.canvasHeight; y += props.gridSize) {
      const isMajor = y % majorInterval === 0
      const percentY = (y / props.canvasHeight) * 100
      lines.push({
        key: `h-${y}`,
        isMajor,
        style: {
          position: 'absolute',
          top: `${percentY}%`,
          left: `-${extension}px`,
          height: isMajor ? '1.5px' : '0.5px',
          width: `calc(100% + ${extension * 2}px)`,
        }
      })
    }
  }

  return lines
})
</script>

<template>
  <template v-if="show && gridLines.length > 0">
    <div
      v-for="line in gridLines"
      :key="line.key"
      :style="line.style"
      :class="line.isMajor ? 'bg-gray-400 dark:bg-gray-500 opacity-50' : 'bg-gray-300 dark:bg-gray-600 opacity-50'"
    />
  </template>
</template>
