import type { Ref } from 'vue'
import { useDrawingStore, SNAP_DISTANCE, type Point } from '~/stores/drawing'

export function useCoordinateTransform(
  canvasEl: Ref<HTMLCanvasElement | null>,
  containerEl: Ref<HTMLDivElement | null>
) {
  const store = useDrawingStore()

  function getCanvasCoordinates(e: MouseEvent): Point {
    const canvas = canvasEl.value
    const container = containerEl.value
    if (!canvas || !container) return { x: 0, y: 0 }

    const containerRect = container.getBoundingClientRect()
    const mouseX = e.clientX - containerRect.left
    const mouseY = e.clientY - containerRect.top

    const borderWidth = 8 // 4px on each side (border-4)
    const baseDisplayWidth = containerRect.width - borderWidth
    const baseDisplayHeight = containerRect.height - borderWidth

    let x = ((mouseX - store.panOffset.x) / store.zoom) * (canvas.width / baseDisplayWidth)
    let y = ((mouseY - store.panOffset.y) / store.zoom) * (canvas.height / baseDisplayHeight)

    // Snap to mirror lines
    if (store.mirrorMode !== 'none') {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      if (store.mirrorMode === 'horizontal' || store.mirrorMode === 'both') {
        if (Math.abs(x - centerX) < SNAP_DISTANCE / store.zoom) {
          x = centerX
        }
      }
      if (store.mirrorMode === 'vertical' || store.mirrorMode === 'both') {
        if (Math.abs(y - centerY) < SNAP_DISTANCE / store.zoom) {
          y = centerY
        }
      }
    }

    // Snap to grid
    if (store.snapToGrid) {
      x = Math.round(x / store.gridSize) * store.gridSize
      y = Math.round(y / store.gridSize) * store.gridSize
    }

    return { x, y }
  }

  return {
    getCanvasCoordinates
  }
}
