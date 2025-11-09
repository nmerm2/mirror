<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  show: boolean
  gridSize: number
  canvasWidth: number
  canvasHeight: number
}

const props = defineProps<Props>()

const gridLines = computed(() => {
  if (!props.show) return []

  const lines: Array<{ key: string; style: Record<string, string> }> = []
  const majorInterval = 200
  const extension = 20

  // Vertical lines
  for (let x = 0; x <= props.canvasWidth; x += props.gridSize) {
    const isMajor = x % majorInterval === 0
    const percentX = (x / props.canvasWidth) * 100
    lines.push({
      key: `v-${x}`,
      style: {
        position: 'absolute',
        left: `${percentX}%`,
        top: `-${extension}px`,
        width: isMajor ? '1.5px' : '0.5px',
        height: `calc(100% + ${extension * 2}px)`,
        backgroundColor: isMajor ? '#b0b0b0' : '#e0e0e0',
        mixBlendMode: 'multiply',
        opacity: '0.5'
      }
    })
  }

  // Horizontal lines
  for (let y = 0; y <= props.canvasHeight; y += props.gridSize) {
    const isMajor = y % majorInterval === 0
    const percentY = (y / props.canvasHeight) * 100
    lines.push({
      key: `h-${y}`,
      style: {
        position: 'absolute',
        top: `${percentY}%`,
        left: `-${extension}px`,
        height: isMajor ? '1.5px' : '0.5px',
        width: `calc(100% + ${extension * 2}px)`,
        backgroundColor: isMajor ? '#b0b0b0' : '#e0e0e0',
        mixBlendMode: 'multiply',
        opacity: '0.5'
      }
    })
  }

  return lines
})
</script>

<template>
  <template v-if="show && gridLines.length > 0">
    <div v-for="line in gridLines" :key="line.key" :style="line.style"></div>
  </template>
</template>
