import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export type DrawingTool = 'polygon' | 'circle' | 'square'
export type MirrorMode = 'none' | 'horizontal' | 'vertical' | 'both'
export type CanvasSize = 'landscape' | 'portrait' | 'square'
export type Color = 'black' | 'white'

export interface Point {
  x: number
  y: number
}

export interface CanvasDimensions {
  width: number
  height: number
  aspectRatio: string
}

export const CANVAS_DIMENSIONS: Record<CanvasSize, CanvasDimensions> = {
  landscape: { width: 3200, height: 2400, aspectRatio: '4 / 3' },
  portrait: { width: 2400, height: 3200, aspectRatio: '3 / 4' },
  square: { width: 2800, height: 2800, aspectRatio: '1 / 1' }
}

export const SNAP_DISTANCE = 20 // pixels

export const useDrawingStore = defineStore('drawing', () => {
  // Drawing state
  const isDrawing = ref(false)
  const drawingTool = ref<DrawingTool>('polygon')
  const color = ref<Color>('black')
  const startPos = ref<Point | null>(null)
  const savedImageData = ref<ImageData | null>(null)
  const polygonPoints = ref<Point[]>([])
  const isDrawingPolygon = ref(false)
  const currentMousePos = ref<Point | null>(null)

  // Canvas state
  const canvasSize = ref<CanvasSize>('landscape')
  const mirrorMode = ref<MirrorMode>('both')

  // View state
  const zoom = ref(1)
  const panOffset = ref<Point>({ x: 0, y: 0 })
  const isPanning = ref(false)
  const panStart = ref<Point | null>(null)

  // UI state
  const showGrid = ref(false)
  const gridSize = ref(50)
  const snapToGrid = ref(false)
  const showMirrorLines = ref(true)

  // History state (undo/redo)
  const historyStack = ref<ImageData[]>([])
  const historyIndex = ref(-1)
  const maxHistorySize = 5

  // Computed
  const currentDimensions = computed(() => CANVAS_DIMENSIONS[canvasSize.value])
  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < historyStack.value.length - 1)

  // Actions
  function setDrawingTool(tool: DrawingTool) {
    drawingTool.value = tool
  }

  function setColor(newColor: Color) {
    color.value = newColor
  }

  function setMirrorMode(mode: MirrorMode) {
    mirrorMode.value = mode
  }

  function setCanvasSize(size: CanvasSize) {
    canvasSize.value = size
  }

  function setZoom(newZoom: number) {
    zoom.value = Math.max(0.5, Math.min(5, newZoom))
  }

  function setPanOffset(offset: Point) {
    panOffset.value = offset
  }

  function resetZoomAndPan() {
    zoom.value = 1
    panOffset.value = { x: 0, y: 0 }
  }

  function startPolygon(imageData: ImageData) {
    isDrawingPolygon.value = true
    savedImageData.value = imageData
  }

  function addPolygonPoint(point: Point) {
    polygonPoints.value.push(point)
  }

  function finishPolygon() {
    polygonPoints.value = []
    isDrawingPolygon.value = false
    savedImageData.value = null
  }

  function cancelPolygon() {
    polygonPoints.value = []
    isDrawingPolygon.value = false
    savedImageData.value = null
  }

  function startShape(point: Point, imageData: ImageData) {
    isDrawing.value = true
    startPos.value = point
    savedImageData.value = imageData
  }

  function finishShape() {
    isDrawing.value = false
    startPos.value = null
    savedImageData.value = null
  }

  function startPan(point: Point) {
    isPanning.value = true
    panStart.value = { x: point.x - panOffset.value.x, y: point.y - panOffset.value.y }
  }

  function updatePan(point: Point) {
    if (panStart.value) {
      panOffset.value = {
        x: point.x - panStart.value.x,
        y: point.y - panStart.value.y
      }
    }
  }

  function endPan() {
    isPanning.value = false
    panStart.value = null
  }

  function pushHistory(imageData: ImageData) {
    // Remove redo states when new action is performed
    if (historyIndex.value < historyStack.value.length - 1) {
      historyStack.value = historyStack.value.slice(0, historyIndex.value + 1)
    }

    // Add new state
    historyStack.value.push(imageData)

    // Limit to maxHistorySize (5)
    if (historyStack.value.length > maxHistorySize) {
      historyStack.value.shift() // Remove oldest
    } else {
      historyIndex.value++
    }
  }

  function undo(): ImageData | null {
    if (historyIndex.value > 0) {
      historyIndex.value--
      return historyStack.value[historyIndex.value]
    }
    return null
  }

  function redo(): ImageData | null {
    if (historyIndex.value < historyStack.value.length - 1) {
      historyIndex.value++
      return historyStack.value[historyIndex.value]
    }
    return null
  }

  function clearHistory() {
    historyStack.value = []
    historyIndex.value = -1
  }

  return {
    // State
    isDrawing,
    drawingTool,
    color,
    startPos,
    savedImageData,
    polygonPoints,
    isDrawingPolygon,
    currentMousePos,
    canvasSize,
    mirrorMode,
    zoom,
    panOffset,
    isPanning,
    panStart,
    showGrid,
    gridSize,
    snapToGrid,
    showMirrorLines,
    historyStack,
    historyIndex,

    // Computed
    currentDimensions,
    canUndo,
    canRedo,

    // Actions
    setDrawingTool,
    setColor,
    setMirrorMode,
    setCanvasSize,
    setZoom,
    setPanOffset,
    resetZoomAndPan,
    startPolygon,
    addPolygonPoint,
    finishPolygon,
    cancelPolygon,
    startShape,
    finishShape,
    startPan,
    updatePan,
    endPan,
    pushHistory,
    undo,
    redo,
    clearHistory
  }
})
