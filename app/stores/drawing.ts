import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export type DrawingTool = 'polygon' | 'circle' | 'square'
export type MirrorMode = 'none' | 'horizontal' | 'vertical' | 'both' | 'mosaic'
export type MosaicRotation = 'none' | 2 | 3 | 4 | 6 | 8
export type MosaicTileCount = 1 | 2 | 3 | 4 | 5 | 6
export type TileGridDivisions = 2 | 4 | 8 | 16 | 32
export type CanvasSize = 'landscape' | 'portrait' | 'square'
export type Color = string // Hex color value (e.g., "#000000")

export interface Point {
  x: number
  y: number
}

export interface Layer {
  id: string
  name: string
  color: string // Hex color
  visible: boolean
  order: number
  canvas: HTMLCanvasElement | null // Off-screen canvas, null until initialized
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
  // Layer state
  const layers = ref<Layer[]>([])
  const activeLayerId = ref<string>('')

  // Drawing state
  const isDrawing = ref(false)
  const drawingTool = ref<DrawingTool>('polygon')
  const color = ref<Color>('#000000') // Default to black hex
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

  // Mosaic state (only used when mirrorMode === 'mosaic')
  const mosaicRotation = ref<MosaicRotation>(4)
  const mosaicTileCountX = ref<MosaicTileCount>(2)
  const mosaicTileCountY = ref<MosaicTileCount>(2)
  const showMosaicLines = ref(true)
  const tileGridDivisions = ref<TileGridDivisions>(4) // Grid divisions per tile in mosaic mode

  // History state (undo/redo)
  const historyStack = ref<ImageData[]>([])
  const historyIndex = ref(-1)
  const maxHistorySize = 5

  // Computed
  const currentDimensions = computed(() => CANVAS_DIMENSIONS[canvasSize.value])
  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < historyStack.value.length - 1)
  const activeLayer = computed(() => layers.value.find(l => l.id === activeLayerId.value) || null)
  const sortedLayers = computed(() => [...layers.value].sort((a, b) => a.order - b.order))

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

  function setMosaicRotation(rotation: MosaicRotation) {
    mosaicRotation.value = rotation
  }

  function setMosaicTileCountX(count: MosaicTileCount) {
    mosaicTileCountX.value = count
  }

  function setMosaicTileCountY(count: MosaicTileCount) {
    mosaicTileCountY.value = count
  }

  function setShowMosaicLines(show: boolean) {
    showMosaicLines.value = show
  }

  function setTileGridDivisions(divisions: TileGridDivisions) {
    tileGridDivisions.value = divisions
  }

  // Layer management actions
  function addLayer(layerColor?: string) {
    const id = `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const order = layers.value.length
    const newLayer: Layer = {
      id,
      name: `Layer ${layers.value.length + 1}`,
      color: layerColor || '#000000',
      visible: true,
      order,
      canvas: null // Will be initialized in the component
    }
    layers.value.push(newLayer)
    activeLayerId.value = id
    return newLayer
  }

  function removeLayer(layerId: string) {
    // Prevent deleting the last layer
    if (layers.value.length <= 1) {
      return false
    }

    const index = layers.value.findIndex(l => l.id === layerId)
    if (index === -1) return false

    layers.value.splice(index, 1)

    // If we deleted the active layer, select another one
    if (activeLayerId.value === layerId) {
      if (layers.value.length > 0) {
        activeLayerId.value = layers.value[Math.min(index, layers.value.length - 1)].id
      }
    }

    return true
  }

  function setActiveLayer(layerId: string) {
    const layer = layers.value.find(l => l.id === layerId)
    if (layer) {
      activeLayerId.value = layerId
      // Update the color to the active layer's color
      color.value = layer.color
    }
  }

  function reorderLayers(fromIndex: number, toIndex: number) {
    if (fromIndex < 0 || fromIndex >= layers.value.length ||
        toIndex < 0 || toIndex >= layers.value.length) {
      return
    }

    const [movedLayer] = layers.value.splice(fromIndex, 1)
    layers.value.splice(toIndex, 0, movedLayer)

    // Update order property
    layers.value.forEach((layer, index) => {
      layer.order = index
    })
  }

  function updateLayerColor(layerId: string, newColor: string) {
    const layer = layers.value.find(l => l.id === layerId)
    if (layer) {
      layer.color = newColor
      // If this is the active layer, update the drawing color too
      if (layerId === activeLayerId.value) {
        color.value = newColor
      }
    }
  }

  function toggleLayerVisibility(layerId: string) {
    const layer = layers.value.find(l => l.id === layerId)
    if (layer) {
      layer.visible = !layer.visible
    }
  }

  function updateLayerName(layerId: string, newName: string) {
    const layer = layers.value.find(l => l.id === layerId)
    if (layer) {
      layer.name = newName
    }
  }

  function setLayerCanvas(layerId: string, canvas: HTMLCanvasElement) {
    const layer = layers.value.find(l => l.id === layerId)
    if (layer) {
      layer.canvas = canvas
    }
  }

  function initializeLayers(dimensions: CanvasDimensions) {
    // Create initial layer if none exist
    if (layers.value.length === 0) {
      const layer = addLayer('#000000')
      if (layer) {
        const canvas = document.createElement('canvas')
        canvas.width = dimensions.width
        canvas.height = dimensions.height
        layer.canvas = canvas
        activeLayerId.value = layer.id
      }
    }
  }

  function clearLayers() {
    layers.value = []
    activeLayerId.value = ''
  }

  return {
    // State
    layers,
    activeLayerId,
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
    mosaicRotation,
    mosaicTileCountX,
    mosaicTileCountY,
    showMosaicLines,
    tileGridDivisions,
    historyStack,
    historyIndex,

    // Computed
    currentDimensions,
    canUndo,
    canRedo,
    activeLayer,
    sortedLayers,

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
    clearHistory,
    setMosaicRotation,
    setMosaicTileCountX,
    setMosaicTileCountY,
    setShowMosaicLines,
    setTileGridDivisions,
    // Layer actions
    addLayer,
    removeLayer,
    setActiveLayer,
    reorderLayers,
    updateLayerColor,
    toggleLayerVisibility,
    updateLayerName,
    setLayerCanvas,
    initializeLayers,
    clearLayers
  }
})
