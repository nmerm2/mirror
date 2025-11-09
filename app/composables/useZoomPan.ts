import { type Ref } from 'vue'
import { useDrawingStore } from '~/stores/drawing'

export function useZoomPan(containerEl: Ref<HTMLDivElement | null>) {
  const store = useDrawingStore()

  function handlePanStart(e: MouseEvent) {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      store.startPan({ x: e.clientX, y: e.clientY })
      e.preventDefault()
    }
  }

  function handlePanMove(e: MouseEvent) {
    if (store.isPanning) {
      store.updatePan({ x: e.clientX, y: e.clientY })
    }
  }

  function handlePanEnd() {
    store.endPan()
  }

  function handleGlobalMouseUp() {
    if (store.isPanning) {
      handlePanEnd()
    }
  }

  function handleZoom(delta: number, mouseX: number | null = null, mouseY: number | null = null) {
    const container = containerEl.value
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const prevZoom = store.zoom
    const newZoom = Math.max(0.5, Math.min(5, prevZoom + delta))

    if (mouseX !== null && mouseY !== null) {
      const mouseRelX = mouseX - containerRect.left
      const mouseRelY = mouseY - containerRect.top
      const zoomRatio = newZoom / prevZoom

      store.setPanOffset({
        x: mouseRelX - (mouseRelX - store.panOffset.x) * zoomRatio,
        y: mouseRelY - (mouseRelY - store.panOffset.y) * zoomRatio
      })
    }

    store.setZoom(newZoom)
  }

  function zoomOnCenter(delta: number) {
    const container = containerEl.value
    if (!container) return

    const rect = container.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    handleZoom(delta, centerX, centerY)
  }

  function handleWheel(e: WheelEvent) {
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    handleZoom(delta, e.clientX, e.clientY)
  }

  function resetZoom() {
    store.resetZoomAndPan()
  }

  return {
    handlePanStart,
    handlePanMove,
    handlePanEnd,
    handleGlobalMouseUp,
    handleZoom,
    zoomOnCenter,
    handleWheel,
    resetZoom
  }
}
