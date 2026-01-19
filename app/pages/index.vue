<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useDrawingStore, SNAP_DISTANCE, type Point } from '~/stores/drawing'
import { useFileOperations } from '~/composables/useFileOperations'
import { useCoordinateTransform } from '~/composables/useCoordinateTransform'
import { useZoomPan } from '~/composables/useZoomPan'
import { useMosaicTransform } from '~/composables/useMosaicTransform'
import { useLibrary, type SavedDrawing } from '~/composables/useLibrary'
import HeaderBar from '~/components/HeaderBar.vue'
import ControlPanel from '~/components/ControlPanel.vue'
import CanvasContainer from '~/components/CanvasContainer.vue'
import BottomToolbar from '~/components/BottomToolbar.vue'
import LibraryModal from '~/components/library/LibraryModal.vue'

const store = useDrawingStore()

// Template refs
const canvasEl = ref<HTMLCanvasElement | null>(null)
const canvasContainerRef = ref<InstanceType<typeof CanvasContainer> | null>(null)

// Get containerEl from CanvasContainer component
const containerEl = computed(() => canvasContainerRef.value?.containerEl ?? null)

// Composables
const { fileInputEl, hasCanvasContent, exportAsPNG, importPNG, handleFileImport } =
  useFileOperations(canvasEl, () => {
    const canvas = canvasEl.value
    if (canvas) saveDrawing(canvas)
  })

const { getCanvasCoordinates } = useCoordinateTransform(canvasEl, containerEl)

const { handlePanStart, handlePanMove, handlePanEnd, handleGlobalMouseUp, handleWheel, zoomOnCenter, resetZoom } =
  useZoomPan(containerEl)

const { getAllTilePoints, getAllTilePointSets } = useMosaicTransform(canvasEl)

const { saveDrawing, listDrawings, loadDrawing, deleteDrawing, renameDrawing, downloadDrawing } = useLibrary()

// Library state
const showLibrary = ref(false)
const libraryDrawings = ref<SavedDrawing[]>([])

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

  // Clear the main display canvas (transparent)
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Initialize layers if needed
  store.initializeLayers(dimensions)

  // Ensure each layer has a properly sized canvas
  store.layers.forEach(layer => {
    if (!layer.canvas) {
      const layerCanvas = document.createElement('canvas')
      layerCanvas.width = dimensions.width
      layerCanvas.height = dimensions.height
      store.setLayerCanvas(layer.id, layerCanvas)
    } else if (layer.canvas.width !== dimensions.width || layer.canvas.height !== dimensions.height) {
      // Resize existing layer canvas
      layer.canvas.width = dimensions.width
      layer.canvas.height = dimensions.height
    }
  })

  // Composite all layers to main canvas
  compositeLayers()

  // Capture initial state for history
  captureHistoryState()
}

// Layer compositing - renders all visible layers to the main canvas
function compositeLayers() {
  const canvas = canvasEl.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Clear the main canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Draw each visible layer in order
  store.sortedLayers.forEach(layer => {
    if (layer.visible && layer.canvas) {
      ctx.drawImage(layer.canvas, 0, 0)
    }
  })
}

// Get the active layer's canvas context
function getActiveLayerContext(): CanvasRenderingContext2D | null {
  const activeLayer = store.activeLayer
  if (!activeLayer || !activeLayer.canvas) return null
  return activeLayer.canvas.getContext('2d')
}

// Capture current state for history (all layers)
function captureHistoryState() {
  const canvas = canvasEl.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  store.clearHistory()
  store.pushHistory(imageData)
}

// Helper function to setup drawing mode (draw or erase)
function setupDrawingMode(ctx: CanvasRenderingContext2D) {
  const isEraser = store.color.toUpperCase() === '#FFFFFF'
  if (isEraser) {
    // Eraser mode: remove pixels (make transparent)
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillStyle = 'rgba(0,0,0,1)' // Color doesn't matter for destination-out
    ctx.strokeStyle = 'rgba(0,0,0,1)'
  } else {
    // Normal drawing mode
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = store.color
    ctx.strokeStyle = store.color
  }
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

  // Setup drawing/erasing mode
  setupDrawingMode(ctx)

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

  // Reset composite operation
  ctx.globalCompositeOperation = 'source-over'
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
      // Setup drawing/erasing mode
      setupDrawingMode(ctx)
      ctx.fill()
      // Reset composite operation
      ctx.globalCompositeOperation = 'source-over'
    } else {
      // For preview, always use normal drawing mode with current color
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

function drawMosaicShape(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  shape: 'circle' | 'square'
) {
  const canvas = canvasEl.value
  if (!canvas) return

  // Get all transformed points for start position
  const startPoints = getAllTilePoints(x1, y1)

  // Setup drawing/erasing mode
  setupDrawingMode(ctx)

  startPoints.forEach((startPoint) => {
    // Calculate the offset from original to transformed start point
    const dx = startPoint.x - x1
    const dy = startPoint.y - y1

    // Apply same offset to end point
    const endX = x2 + dx
    const endY = y2 + dy

    ctx.beginPath()
    if (shape === 'circle') {
      const radius = Math.sqrt(
        Math.pow(endX - startPoint.x, 2) + Math.pow(endY - startPoint.y, 2)
      )
      ctx.arc(startPoint.x, startPoint.y, radius, 0, Math.PI * 2)
      ctx.fill()
    } else if (shape === 'square') {
      const width = endX - startPoint.x
      const height = endY - startPoint.y
      ctx.fillRect(startPoint.x, startPoint.y, width, height)
    }
  })

  // Reset composite operation
  ctx.globalCompositeOperation = 'source-over'
}

function drawMosaicPolygon(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  closeShape: boolean = false
) {
  if (points.length === 0) return

  const allPointSets = getAllTilePointSets(points)

  allPointSets.forEach((pointSet) => {
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
      // Setup drawing/erasing mode
      setupDrawingMode(ctx)
      ctx.fill()
      // Reset composite operation
      ctx.globalCompositeOperation = 'source-over'
    } else {
      // For preview, always use normal drawing mode with current color
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
  const ctx = getActiveLayerContext()
  if (!ctx) return

  const activeLayer = store.activeLayer
  if (!activeLayer || !activeLayer.canvas) return

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
        if (store.mirrorMode === 'mosaic') {
          drawMosaicPolygon(ctx, store.polygonPoints, true)
        } else {
          drawMirroredPolygon(ctx, store.polygonPoints, true)
        }

        // Composite layers and capture history
        compositeLayers()
        const canvas = canvasEl.value
        if (canvas) {
          const mainCtx = canvas.getContext('2d')
          if (mainCtx) {
            const imageData = mainCtx.getImageData(0, 0, canvas.width, canvas.height)
            store.pushHistory(imageData)
          }
        }

        store.finishPolygon()
        return
      }
    }
  }

  // Add point
  store.addPolygonPoint(pos)

  // Start polygon if first point
  if (!store.isDrawingPolygon) {
    const imageData = ctx.getImageData(0, 0, activeLayer.canvas.width, activeLayer.canvas.height)
    store.startPolygon(imageData)
  }

  // Redraw on active layer
  if (store.savedImageData) {
    ctx.putImageData(store.savedImageData, 0, 0)
  }
  if (store.mirrorMode === 'mosaic') {
    drawMosaicPolygon(ctx, store.polygonPoints, false)
  } else {
    drawMirroredPolygon(ctx, store.polygonPoints, false)
  }

  // Composite to main canvas
  compositeLayers()
}

function handleDoubleClick(_e: MouseEvent) {
  if (
    store.drawingTool === 'polygon' &&
    store.isDrawingPolygon &&
    store.polygonPoints.length >= 3
  ) {
    const ctx = getActiveLayerContext()
    if (!ctx) return

    if (store.savedImageData) {
      ctx.putImageData(store.savedImageData, 0, 0)
    }
    if (store.mirrorMode === 'mosaic') {
      drawMosaicPolygon(ctx, store.polygonPoints, true)
    } else {
      drawMirroredPolygon(ctx, store.polygonPoints, true)
    }

    // Composite layers and capture history
    compositeLayers()
    const canvas = canvasEl.value
    if (canvas) {
      const mainCtx = canvas.getContext('2d')
      if (mainCtx) {
        const imageData = mainCtx.getImageData(0, 0, canvas.width, canvas.height)
        store.pushHistory(imageData)
      }
    }

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

  const ctx = getActiveLayerContext()
  if (!ctx) return

  const activeLayer = store.activeLayer
  if (!activeLayer || !activeLayer.canvas) return

  const pos = getCanvasCoordinates(e)

  if (store.drawingTool === 'polygon') {
    handlePolygonClick(e)
    return
  }

  const imageData = ctx.getImageData(0, 0, activeLayer.canvas.width, activeLayer.canvas.height)
  store.startShape(pos, imageData)
}

function draw(e: MouseEvent) {
  if (store.isPanning) {
    handlePanMove(e)
    return
  }

  const pos = getCanvasCoordinates(e)
  store.currentMousePos = pos

  const ctx = getActiveLayerContext()
  if (!ctx) return

  const activeLayer = store.activeLayer
  if (!activeLayer || !activeLayer.canvas) return

  // Polygon preview
  if (store.drawingTool === 'polygon' && store.isDrawingPolygon) {
    if (store.savedImageData) {
      ctx.putImageData(store.savedImageData, 0, 0)
    }
    if (store.mirrorMode === 'mosaic') {
      drawMosaicPolygon(ctx, store.polygonPoints, false)
    } else {
      drawMirroredPolygon(ctx, store.polygonPoints, false)
    }

    // Draw preview line
    if (store.polygonPoints.length > 0) {
      const lastPoint = store.polygonPoints[store.polygonPoints.length - 1]
      if (!lastPoint) {
        compositeLayers()
        return
      }

      if (store.mirrorMode === 'mosaic') {
        // For mosaic mode, get all transformed points
        const lastPoints = getAllTilePoints(lastPoint.x, lastPoint.y)
        const currentPoints = getAllTilePoints(pos.x, pos.y)

        ctx.strokeStyle = store.color
        ctx.globalAlpha = 0.5
        ctx.lineWidth = 4 / store.zoom
        ctx.setLineDash([8 / store.zoom, 8 / store.zoom])

        // Draw preview lines from each transformed last point to corresponding current point
        lastPoints.forEach((lp, index) => {
          const cp = currentPoints[index]
          if (!cp) return
          ctx.beginPath()
          ctx.moveTo(lp.x, lp.y)
          ctx.lineTo(cp.x, cp.y)
          ctx.stroke()
        })

        ctx.setLineDash([])
        ctx.globalAlpha = 1.0
      } else {
        // Mirror mode preview
        const previewSets: Array<{ from: Point; to: Point }> = []

        previewSets.push({ from: lastPoint, to: pos })

        if (store.mirrorMode === 'horizontal' || store.mirrorMode === 'both') {
          previewSets.push({
            from: { x: activeLayer.canvas.width - lastPoint.x, y: lastPoint.y },
            to: { x: activeLayer.canvas.width - pos.x, y: pos.y }
          })
        }
        if (store.mirrorMode === 'vertical' || store.mirrorMode === 'both') {
          previewSets.push({
            from: { x: lastPoint.x, y: activeLayer.canvas.height - lastPoint.y },
            to: { x: pos.x, y: activeLayer.canvas.height - pos.y }
          })
        }
        if (store.mirrorMode === 'both') {
          previewSets.push({
            from: { x: activeLayer.canvas.width - lastPoint.x, y: activeLayer.canvas.height - lastPoint.y },
            to: { x: activeLayer.canvas.width - pos.x, y: activeLayer.canvas.height - pos.y }
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
    }

    // Composite to main canvas for preview
    compositeLayers()
    return
  }

  // Shape preview
  if (!store.isDrawing || !store.startPos || !store.savedImageData) return

  ctx.putImageData(store.savedImageData, 0, 0)
  ctx.globalAlpha = 0.5
  if (store.drawingTool === 'circle' || store.drawingTool === 'square') {
    if (store.mirrorMode === 'mosaic') {
      drawMosaicShape(ctx, store.startPos.x, store.startPos.y, pos.x, pos.y, store.drawingTool)
    } else {
      drawMirroredShape(ctx, store.startPos.x, store.startPos.y, pos.x, pos.y, store.drawingTool)
    }
  }
  ctx.globalAlpha = 1.0

  // Composite to main canvas for preview
  compositeLayers()
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

  const ctx = getActiveLayerContext()
  if (!ctx) return

  const pos = getCanvasCoordinates(e)

  if (store.savedImageData) {
    ctx.putImageData(store.savedImageData, 0, 0)
  }
  if (store.startPos && (store.drawingTool === 'circle' || store.drawingTool === 'square')) {
    if (store.mirrorMode === 'mosaic') {
      drawMosaicShape(ctx, store.startPos.x, store.startPos.y, pos.x, pos.y, store.drawingTool)
    } else {
      drawMirroredShape(ctx, store.startPos.x, store.startPos.y, pos.x, pos.y, store.drawingTool)
    }

    // Composite layers and capture history
    compositeLayers()
    const canvas = canvasEl.value
    if (canvas) {
      const mainCtx = canvas.getContext('2d')
      if (mainCtx) {
        const imageData = mainCtx.getImageData(0, 0, canvas.width, canvas.height)
        store.pushHistory(imageData)
      }
    }
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

  // Clear all layers
  store.layers.forEach(layer => {
    if (layer.canvas) {
      const ctx = layer.canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height)
      }
    }
  })

  // Composite and capture history
  compositeLayers()
  const canvas = canvasEl.value
  if (canvas) {
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      store.pushHistory(imageData)
    }
  }

  store.cancelPolygon()
}

// Invert colors (negative)
function invertColors() {
  // Invert colors on all layers
  store.layers.forEach(layer => {
    if (layer.canvas) {
      const ctx = layer.canvas.getContext('2d')
      if (!ctx) return

      const imageData = ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height)
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
  })

  // Composite and capture history
  compositeLayers()
  const canvas = canvasEl.value
  if (canvas) {
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const newImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      store.pushHistory(newImageData)
    }
  }
}

// Undo/Redo operations
function performUndo() {
  const canvas = canvasEl.value
  if (!canvas) return

  const imageData = store.undo()
  if (imageData) {
    // Clear all layers and put the undone state on the active layer
    // This "flattens" the undo to the active layer
    store.layers.forEach(layer => {
      if (layer.canvas) {
        const ctx = layer.canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height)
        }
      }
    })

    // Put the undone image data on the active layer
    const activeLayerCtx = getActiveLayerContext()
    if (activeLayerCtx) {
      activeLayerCtx.putImageData(imageData, 0, 0)
    }

    // Composite to main canvas
    compositeLayers()

    // Cancel any active polygon drawing
    if (store.isDrawingPolygon) {
      store.cancelPolygon()
    }
  }
}

function performRedo() {
  const canvas = canvasEl.value
  if (!canvas) return

  const imageData = store.redo()
  if (imageData) {
    // Clear all layers and put the redone state on the active layer
    store.layers.forEach(layer => {
      if (layer.canvas) {
        const ctx = layer.canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height)
        }
      }
    })

    // Put the redone image data on the active layer
    const activeLayerCtx = getActiveLayerContext()
    if (activeLayerCtx) {
      activeLayerCtx.putImageData(imageData, 0, 0)
    }

    // Composite to main canvas
    compositeLayers()

    // Cancel any active polygon drawing
    if (store.isDrawingPolygon) {
      store.cancelPolygon()
    }
  }
}

// Cancel polygon
function cancelPolygon() {
  const ctx = getActiveLayerContext()
  if (!ctx) return

  if (store.savedImageData) {
    ctx.putImageData(store.savedImageData, 0, 0)
    // Composite to main canvas
    compositeLayers()
  }

  store.cancelPolygon()
}

// Library functions
function handleSaveDrawing() {
  const canvas = canvasEl.value
  if (!canvas) return

  if (!hasCanvasContent()) {
    alert('Canvas is empty. Draw something first!')
    return
  }

  saveDrawing(canvas)
  alert('Drawing saved to library!')
}

function openLibrary() {
  libraryDrawings.value = listDrawings()
  showLibrary.value = true
}

function closeLibrary() {
  showLibrary.value = false
}

async function handleLoadDrawing(drawing: SavedDrawing) {
  // Prompt to save current drawing if it has content
  if (hasCanvasContent()) {
    const shouldSave = window.confirm(
      'Your current canvas has unsaved changes. Would you like to save before loading?'
    )
    if (shouldSave) {
      const canvas = canvasEl.value
      if (canvas) {
        saveDrawing(canvas)
        alert('Drawing saved to library!')
      }
    } else {
      const shouldContinue = window.confirm(
        'Loading a drawing will replace your current canvas. Continue?'
      )
      if (!shouldContinue) {
        return
      }
    }
  }

  const canvas = canvasEl.value
  if (!canvas) return

  try {
    await loadDrawing(drawing, canvas, initializeCanvas)
    closeLibrary()
  } catch (error) {
    console.error('Error loading drawing:', error)
    alert('Failed to load drawing. Please try again.')
  }
}

function handleDeleteDrawing(id: string) {
  deleteDrawing(id)
  libraryDrawings.value = listDrawings()
}

function handleRenameDrawing(payload: { id: string; newName: string }) {
  renameDrawing(payload.id, payload.newName)
  libraryDrawings.value = listDrawings()
}

function handleDownloadDrawing(drawing: SavedDrawing) {
  downloadDrawing(drawing)
}

// Keyboard handlers
function handleKeyDown(e: KeyboardEvent) {
  // Undo: Cmd+Z (Mac) or Ctrl+Z (Windows/Linux)
  if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    performUndo()
    return
  }

  // Redo: Cmd+Shift+Z (Mac) or Ctrl+Shift+Z (Windows/Linux)
  if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
    e.preventDefault()
    performRedo()
    return
  }

  if (e.key === 'Escape') {
    if (showLibrary.value) {
      closeLibrary()
    } else if (store.isDrawingPolygon) {
      cancelPolygon()
    }
  }
}

function handleBeforeUnload(e: BeforeUnloadEvent) {
  // Only prevent unload if canvas has content
  if (hasCanvasContent()) {
    e.preventDefault()
    e.returnValue = ''
  }
}

// Watch for layer changes and re-composite
watch(
  () => store.layers.map(l => ({ visible: l.visible, order: l.order })),
  () => {
    // Re-composite when layer visibility or order changes
    compositeLayers()
  },
  { deep: true }
)

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
  <div class="h-screen flex flex-col overflow-hidden bg-white dark:bg-gray-900 transition-colors">
    <!-- Header Bar -->
    <HeaderBar :canvas-size="store.canvasSize" :can-undo="store.canUndo" :can-redo="store.canRedo" @save="handleSaveDrawing" @library="openLibrary" @import="importPNG" @export="exportAsPNG" @clear="clearCanvas" @invert="invertColors" @undo="performUndo" @redo="performRedo" @canvas-size-change="handleCanvasSizeChange" />

    <!-- Main Content Area -->
    <div class="flex-1 flex overflow-hidden p-4 gap-4">
      <!-- Control Panel -->
      <ControlPanel @cancel-polygon="cancelPolygon" @set-drawing-tool="setDrawingTool" />

      <!-- Hidden file input -->
      <input ref="fileInputEl" type="file" accept="image/*" style="display: none" @change="handleFileImport" >

      <!-- Canvas Container -->
      <CanvasContainer ref="canvasContainerRef" :aspect-ratio="containerAspectRatio" :zoom="store.zoom" :pan-offset="store.panOffset" :is-panning="store.isPanning" :show-grid="store.showGrid" :grid-size="store.gridSize" :canvas-width="store.currentDimensions.width" :canvas-height="store.currentDimensions.height" :show-mirror-lines="store.showMirrorLines" :mirror-mode="store.mirrorMode" :mosaic-rotation="store.mosaicRotation" :mosaic-tile-count-x="store.mosaicTileCountX" :mosaic-tile-count-y="store.mosaicTileCountY" :show-mosaic-lines="store.showMosaicLines" :tile-grid-divisions="store.tileGridDivisions">
        <!-- Drawing Canvas -->
        <canvas
  ref="canvasEl" class="w-full h-full pointer-events-none" :style="{
          touchAction: 'none',
          transform: `translate(${store.panOffset.x}px, ${store.panOffset.y}px) scale(${store.zoom})`,
          transformOrigin: '0 0'
        }"/>
      </CanvasContainer>
    </div>

    <!-- Bottom Toolbar -->
    <BottomToolbar :zoom="store.zoom" @zoom-in="zoomOnCenter(0.5)" @zoom-out="zoomOnCenter(-0.5)" @reset-zoom="resetZoom" />

    <!-- Library Modal -->
    <LibraryModal v-if="showLibrary" :drawings="libraryDrawings" @close="closeLibrary" @load="handleLoadDrawing" @delete="handleDeleteDrawing" @rename="handleRenameDrawing" @download="handleDownloadDrawing" />
  </div>
</template>
