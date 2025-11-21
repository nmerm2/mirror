<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useDrawingStore, SNAP_DISTANCE, type Point } from '~/stores/drawing'
import { useFileOperations } from '~/composables/useFileOperations'
import { useCoordinateTransform } from '~/composables/useCoordinateTransform'
import { useZoomPan } from '~/composables/useZoomPan'
import ControlPanel from '~/components/ControlPanel.vue'
import CanvasContainer from '~/components/CanvasContainer.vue'

const store = useDrawingStore()

// Template refs
const canvasEl = ref<HTMLCanvasElement | null>(null)
const canvasContainerRef = ref<InstanceType<typeof CanvasContainer> | null>(null)

// Get containerEl from CanvasContainer component
const containerEl = computed(() => canvasContainerRef.value?.containerEl ?? null)

// Composables
const { fileInputEl, hasCanvasContent, exportAsPNG, importPNG, handleFileImport } =
  useFileOperations(canvasEl)

const { getCanvasCoordinates } = useCoordinateTransform(canvasEl, containerEl)

const { handlePanStart, handlePanMove, handlePanEnd, handleGlobalMouseUp, handleWheel, zoomOnCenter, resetZoom } =
  useZoomPan(containerEl)

// Computed
const containerAspectRatio = computed(() => store.currentDimensions.aspectRatio)

// Canvas initialization
function initializeCanvas() {
  const canvas = canvasEl.value
  if (!canvas) return

  const dimensions = store.currentDimensions
  canvas.width = dimensions.width
  canvas.height = dimensions.height

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

// Drawing functions
function drawMirroredShape(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  shape: 'circle' | 'square'
) {
  const canvas = canvasEl.value
  if (!canvas) return

  const points: Array<{ x1: number; y1: number; x2: number; y2: number }> = []

  points.push({ x1, y1, x2, y2 })

  if (store.mirrorMode === 'horizontal' || store.mirrorMode === 'both') {
    points.push({
      x1: canvas.width - x1,
      y1,
      x2: canvas.width - x2,
      y2
    })
  }
  if (store.mirrorMode === 'vertical' || store.mirrorMode === 'both') {
    points.push({
      x1,
      y1: canvas.height - y1,
      x2,
      y2: canvas.height - y2
    })
  }
  if (store.mirrorMode === 'both') {
    points.push({
      x1: canvas.width - x1,
      y1: canvas.height - y1,
      x2: canvas.width - x2,
      y2: canvas.height - y2
    })
  }

  ctx.fillStyle = store.color

  points.forEach((point) => {
    ctx.beginPath()
    if (shape === 'circle') {
      const radius = Math.sqrt(
        Math.pow(point.x2 - point.x1, 2) + Math.pow(point.y2 - point.y1, 2)
      )
      ctx.arc(point.x1, point.y1, radius, 0, Math.PI * 2)
      ctx.fill()
    } else if (shape === 'square') {
      const width = point.x2 - point.x1
      const height = point.y2 - point.y1
      ctx.fillRect(point.x1, point.y1, width, height)
    }
  })
}

function drawMirroredPolygon(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  closeShape: boolean = false
) {
  if (points.length === 0) return

  const canvas = canvasEl.value
  if (!canvas) return

  const mirroredPointSets: Point[][] = []

  mirroredPointSets.push(points)

  if (store.mirrorMode === 'horizontal' || store.mirrorMode === 'both') {
    mirroredPointSets.push(points.map((p) => ({ x: canvas.width - p.x, y: p.y })))
  }
  if (store.mirrorMode === 'vertical' || store.mirrorMode === 'both') {
    mirroredPointSets.push(points.map((p) => ({ x: p.x, y: canvas.height - p.y })))
  }
  if (store.mirrorMode === 'both') {
    mirroredPointSets.push(points.map((p) => ({ x: canvas.width - p.x, y: canvas.height - p.y })))
  }

  mirroredPointSets.forEach((pointSet) => {
    ctx.beginPath()
    const firstPoint = pointSet[0]
    if (!firstPoint) return
    ctx.moveTo(firstPoint.x, firstPoint.y)

    for (let i = 1; i < pointSet.length; i++) {
      const point = pointSet[i]
      if (!point) continue
      ctx.lineTo(point.x, point.y)
    }

    if (closeShape) {
      ctx.closePath()
      ctx.fillStyle = store.color
      ctx.fill()
    } else {
      ctx.strokeStyle = store.color
      ctx.lineWidth = 4 / store.zoom
      ctx.stroke()

      // Draw corner markers
      pointSet.forEach((point, index) => {
        ctx.beginPath()
        ctx.arc(point.x, point.y, 10 / store.zoom, 0, Math.PI * 2)
        ctx.fillStyle = index === 0 ? '#ef4444' : '#3b82f6'
        ctx.fill()
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 3 / store.zoom
        ctx.stroke()
      })
    }
  })
}

// Event handlers
function handleClick(e: MouseEvent) {
  if (store.drawingTool === 'polygon' && !e.shiftKey && e.button !== 1) {
    handlePolygonClick(e)
  }
}

function handlePolygonClick(e: MouseEvent) {
  const canvas = canvasEl.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const pos = getCanvasCoordinates(e)

  // Check if clicking near first point to close
  if (store.polygonPoints.length >= 3) {
    const firstPoint = store.polygonPoints[0]
    if (firstPoint) {
      const distance = Math.sqrt(
        Math.pow(pos.x - firstPoint.x, 2) + Math.pow(pos.y - firstPoint.y, 2)
      )

      if (distance < SNAP_DISTANCE / store.zoom) {
        // Close the polygon
        if (store.savedImageData) {
          ctx.putImageData(store.savedImageData, 0, 0)
        }
        drawMirroredPolygon(ctx, store.polygonPoints, true)
        store.finishPolygon()
        return
      }
    }
  }

  // Add point
  store.addPolygonPoint(pos)

  // Start polygon if first point
  if (!store.isDrawingPolygon) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    store.startPolygon(imageData)
  }

  // Redraw
  if (store.savedImageData) {
    ctx.putImageData(store.savedImageData, 0, 0)
  }
  drawMirroredPolygon(ctx, store.polygonPoints, false)
}

function handleDoubleClick(e: MouseEvent) {
  if (
    store.drawingTool === 'polygon' &&
    store.isDrawingPolygon &&
    store.polygonPoints.length >= 3
  ) {
    const canvas = canvasEl.value
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (store.savedImageData) {
      ctx.putImageData(store.savedImageData, 0, 0)
    }
    drawMirroredPolygon(ctx, store.polygonPoints, true)
    store.finishPolygon()
  }
}

function handleMouseDown(e: MouseEvent) {
  if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
    handlePanStart(e)
  } else if (store.drawingTool !== 'polygon') {
    startDrawing(e)
  }
}

function startDrawing(e: MouseEvent) {
  if (e.shiftKey || e.button === 1) return

  const canvas = canvasEl.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const pos = getCanvasCoordinates(e)

  if (store.drawingTool === 'polygon') {
    handlePolygonClick(e)
    return
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  store.startShape(pos, imageData)
}

function draw(e: MouseEvent) {
  if (store.isPanning) {
    handlePanMove(e)
    return
  }

  const pos = getCanvasCoordinates(e)
  store.currentMousePos = pos

  const canvas = canvasEl.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Polygon preview
  if (store.drawingTool === 'polygon' && store.isDrawingPolygon) {
    if (store.savedImageData) {
      ctx.putImageData(store.savedImageData, 0, 0)
    }
    drawMirroredPolygon(ctx, store.polygonPoints, false)

    // Draw preview line
    if (store.polygonPoints.length > 0) {
      const lastPoint = store.polygonPoints[store.polygonPoints.length - 1]
      if (!lastPoint) return
      const previewSets: Array<{ from: Point; to: Point }> = []

      previewSets.push({ from: lastPoint, to: pos })

      if (store.mirrorMode === 'horizontal' || store.mirrorMode === 'both') {
        previewSets.push({
          from: { x: canvas.width - lastPoint.x, y: lastPoint.y },
          to: { x: canvas.width - pos.x, y: pos.y }
        })
      }
      if (store.mirrorMode === 'vertical' || store.mirrorMode === 'both') {
        previewSets.push({
          from: { x: lastPoint.x, y: canvas.height - lastPoint.y },
          to: { x: pos.x, y: canvas.height - pos.y }
        })
      }
      if (store.mirrorMode === 'both') {
        previewSets.push({
          from: { x: canvas.width - lastPoint.x, y: canvas.height - lastPoint.y },
          to: { x: canvas.width - pos.x, y: canvas.height - pos.y }
        })
      }

      ctx.strokeStyle = store.color
      ctx.globalAlpha = 0.5
      ctx.lineWidth = 4 / store.zoom
      ctx.setLineDash([8 / store.zoom, 8 / store.zoom])

      previewSets.forEach((set) => {
        ctx.beginPath()
        ctx.moveTo(set.from.x, set.from.y)
        ctx.lineTo(set.to.x, set.to.y)
        ctx.stroke()
      })

      ctx.setLineDash([])
      ctx.globalAlpha = 1.0
    }
    return
  }

  // Shape preview
  if (!store.isDrawing || !store.startPos || !store.savedImageData) return

  ctx.putImageData(store.savedImageData, 0, 0)
  ctx.globalAlpha = 0.5
  if (store.drawingTool === 'circle' || store.drawingTool === 'square') {
    drawMirroredShape(ctx, store.startPos.x, store.startPos.y, pos.x, pos.y, store.drawingTool)
  }
  ctx.globalAlpha = 1.0
}

function handleMouseUp(e: MouseEvent) {
  if (store.drawingTool !== 'polygon') {
    stopDrawing(e)
  } else if (store.isPanning) {
    handlePanEnd()
  }
}

function stopDrawing(e: MouseEvent) {
  if (store.isPanning) {
    handlePanEnd()
    return
  }

  if (store.drawingTool === 'polygon' || !store.isDrawing) return

  const canvas = canvasEl.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const pos = getCanvasCoordinates(e)

  if (store.savedImageData) {
    ctx.putImageData(store.savedImageData, 0, 0)
  }
  if (store.startPos && (store.drawingTool === 'circle' || store.drawingTool === 'square')) {
    drawMirroredShape(ctx, store.startPos.x, store.startPos.y, pos.x, pos.y, store.drawingTool)
  }

  store.finishShape()
}

function handleMouseLeave(e: MouseEvent) {
  if (store.drawingTool !== 'polygon') {
    stopDrawing(e)
  }
}

// Canvas size management
function handleCanvasSizeChange(newSize: typeof store.canvasSize) {
  if (newSize === store.canvasSize) return

  if (hasCanvasContent()) {
    if (!window.confirm('Changing canvas size will clear your current drawing. Continue?')) {
      return
    }
  }

  if (store.isDrawingPolygon) {
    store.cancelPolygon()
  }

  store.setCanvasSize(newSize)
  store.resetZoomAndPan()
  initializeCanvas()
}

// Tool management
function setDrawingTool(tool: typeof store.drawingTool) {
  if (store.isDrawingPolygon) {
    cancelPolygon()
  }
  store.setDrawingTool(tool)
}

// Clear canvas
function clearCanvas() {
  if (!window.confirm('Are you sure you want to clear the canvas? This cannot be undone.')) {
    return
  }

  const canvas = canvasEl.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  store.cancelPolygon()
}

// Invert colors (negative)
function invertColors() {
  const canvas = canvasEl.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  // Invert each pixel
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i]         // Red
    data[i + 1] = 255 - data[i + 1] // Green
    data[i + 2] = 255 - data[i + 2] // Blue
    // data[i + 3] is alpha, leave unchanged
  }

  ctx.putImageData(imageData, 0, 0)
}

// Cancel polygon
function cancelPolygon() {
  const canvas = canvasEl.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  if (store.savedImageData) {
    ctx.putImageData(store.savedImageData, 0, 0)
  }

  store.cancelPolygon()
}

// Keyboard handlers
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && store.isDrawingPolygon) {
    cancelPolygon()
  }
}

function handleBeforeUnload(e: BeforeUnloadEvent) {
  e.preventDefault()
  e.returnValue = ''
}

// Lifecycle
onMounted(() => {
  initializeCanvas()

  // Attach event listeners to container for polygon drawing outside canvas
  const container = containerEl.value
  if (container) {
    container.addEventListener('click', handleClick)
    container.addEventListener('dblclick', handleDoubleClick)
    container.addEventListener('mousedown', handleMouseDown)
    container.addEventListener('mousemove', draw)
    container.addEventListener('mouseup', handleMouseUp)
    container.addEventListener('mouseleave', handleMouseLeave)
    container.addEventListener('wheel', handleWheel, { passive: false })
  }

  window.addEventListener('mouseup', handleGlobalMouseUp)
  window.addEventListener('beforeunload', handleBeforeUnload)
  window.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  const container = containerEl.value
  if (container) {
    container.removeEventListener('click', handleClick)
    container.removeEventListener('dblclick', handleDoubleClick)
    container.removeEventListener('mousedown', handleMouseDown)
    container.removeEventListener('mousemove', draw)
    container.removeEventListener('mouseup', handleMouseUp)
    container.removeEventListener('mouseleave', handleMouseLeave)
    container.removeEventListener('wheel', handleWheel)
  }

  window.removeEventListener('mouseup', handleGlobalMouseUp)
  window.removeEventListener('beforeunload', handleBeforeUnload)
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div class="h-screen flex overflow-hidden p-4 gap-4 bg-white dark:bg-gray-900 transition-colors">
    <!-- Control Panel -->
    <ControlPanel @cancel-polygon="cancelPolygon" @clear-canvas="clearCanvas" @invert-colors="invertColors" @import-p-n-g="importPNG" @export-p-n-g="exportAsPNG" @canvas-size-change="handleCanvasSizeChange" @set-drawing-tool="setDrawingTool" @zoom-in="zoomOnCenter(0.5)" @zoom-out="zoomOnCenter(-0.5)" @reset-zoom="resetZoom" />

    <!-- Hidden file input -->
    <input ref="fileInputEl" type="file" accept="image/*" @change="handleFileImport" style="display: none" />

    <!-- Canvas Container -->
    <CanvasContainer ref="canvasContainerRef" :aspect-ratio="containerAspectRatio" :zoom="store.zoom" :pan-offset="store.panOffset" :is-panning="store.isPanning" :show-grid="store.showGrid" :grid-size="store.gridSize" :canvas-width="store.currentDimensions.width" :canvas-height="store.currentDimensions.height" :show-mirror-lines="store.showMirrorLines" :mirror-mode="store.mirrorMode">
      <!-- Drawing Canvas -->
      <canvas ref="canvasEl" class="w-full h-full pointer-events-none" :style="{
        touchAction: 'none',
        transform: `translate(${store.panOffset.x}px, ${store.panOffset.y}px) scale(${store.zoom})`,
        transformOrigin: '0 0'
      }"></canvas>
    </CanvasContainer>
  </div>
</template>
