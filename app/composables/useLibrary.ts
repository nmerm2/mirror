import { useDrawingStore } from '~/stores/drawing'

export interface SavedLayer {
  id: string
  name: string
  color: string
  visible: boolean
  order: number
  canvasData: string // base64 encoded PNG
}

export interface SavedDrawing {
  id: string
  version: string
  name: string
  timestamp: number
  canvasData: string // base64 encoded PNG (composited, for backward compatibility)
  thumbnail: string // small base64 preview
  layers?: SavedLayer[] // Layer data (v2.0.0+)
  settings: {
    canvasSize: 'landscape' | 'portrait' | 'square'
    mirrorMode: 'none' | 'horizontal' | 'vertical' | 'both' | 'mosaic'
    color: string // Hex color
    drawingTool: 'polygon' | 'circle' | 'square'
    showGrid: boolean
    gridSize: number
    snapToGrid: boolean
    showMirrorLines: boolean
  }
}

const STORAGE_KEY = 'mirror-drawing-library'
const CURRENT_VERSION = '2.0.0' // Updated to support layers
const THUMBNAIL_WIDTH = 300

export function useLibrary() {
  const store = useDrawingStore()

  /**
   * Generate a default name with timestamp
   */
  function generateDefaultName(): string {
    const date = new Date()
    const formatted = date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    return `Drawing - ${formatted}`
  }

  /**
   * Generate thumbnail from canvas
   */
  function generateThumbnail(canvas: HTMLCanvasElement): string {
    const thumbCanvas = document.createElement('canvas')
    const aspectRatio = canvas.width / canvas.height

    thumbCanvas.width = THUMBNAIL_WIDTH
    thumbCanvas.height = Math.round(THUMBNAIL_WIDTH / aspectRatio)

    const ctx = thumbCanvas.getContext('2d')
    if (!ctx) return ''

    ctx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height)
    return thumbCanvas.toDataURL('image/png')
  }

  /**
   * Save current canvas and settings to library
   */
  function saveDrawing(canvas: HTMLCanvasElement, customName?: string): SavedDrawing {
    // Save composited canvas data (for backward compatibility and thumbnail)
    const canvasData = canvas.toDataURL('image/png')
    const thumbnail = generateThumbnail(canvas)

    // Save all layers
    const savedLayers: SavedLayer[] = store.layers.map(layer => ({
      id: layer.id,
      name: layer.name,
      color: layer.color,
      visible: layer.visible,
      order: layer.order,
      canvasData: layer.canvas ? layer.canvas.toDataURL('image/png') : ''
    }))

    const drawing: SavedDrawing = {
      id: `drawing-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      version: CURRENT_VERSION,
      name: customName || generateDefaultName(),
      timestamp: Date.now(),
      canvasData,
      thumbnail,
      layers: savedLayers,
      settings: {
        canvasSize: store.canvasSize,
        mirrorMode: store.mirrorMode,
        color: store.color,
        drawingTool: store.drawingTool,
        showGrid: store.showGrid,
        gridSize: store.gridSize,
        snapToGrid: store.snapToGrid,
        showMirrorLines: store.showMirrorLines
      }
    }

    const drawings = listDrawings()
    drawings.unshift(drawing) // Add to beginning
    saveToStorage(drawings)

    return drawing
  }

  /**
   * Load all drawings from localStorage
   */
  function listDrawings(): SavedDrawing[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return []

      const drawings = JSON.parse(stored) as SavedDrawing[]
      return drawings.sort((a, b) => b.timestamp - a.timestamp)
    } catch (error) {
      console.error('Error loading drawings from storage:', error)
      return []
    }
  }

  /**
   * Load a drawing onto the canvas
   */
  async function loadDrawing(
    drawing: SavedDrawing,
    canvas: HTMLCanvasElement,
    initializeCanvas: () => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Cancel any active polygon
      store.cancelPolygon()

      // Apply settings first
      store.canvasSize = drawing.settings.canvasSize
      store.mirrorMode = drawing.settings.mirrorMode
      store.color = drawing.settings.color
      store.drawingTool = drawing.settings.drawingTool
      store.showGrid = drawing.settings.showGrid
      store.gridSize = drawing.settings.gridSize
      store.snapToGrid = drawing.settings.snapToGrid
      store.showMirrorLines = drawing.settings.showMirrorLines

      // Clear existing layers and initialize
      store.clearLayers()
      initializeCanvas()

      // Check if drawing has layers (v2.0.0+)
      if (drawing.layers && drawing.layers.length > 0) {
        // Load layered drawing
        loadLayeredDrawing(drawing, canvas, resolve, reject)
      } else {
        // Load legacy drawing (v1.0.0) - convert to single layer
        loadLegacyDrawing(drawing, canvas, resolve, reject)
      }
    })
  }

  /**
   * Load a drawing with layers (v2.0.0+)
   */
  function loadLayeredDrawing(
    drawing: SavedDrawing,
    canvas: HTMLCanvasElement,
    resolve: () => void,
    reject: (error: Error) => void
  ): void {
    if (!drawing.layers) {
      reject(new Error('No layers found in drawing'))
      return
    }

    // Clear existing layers
    store.clearLayers()

    // Load each layer
    const layerPromises = drawing.layers.map(savedLayer => {
      return new Promise<void>((resolveLayer, rejectLayer) => {
        // Create layer in store
        const newLayer = store.addLayer(savedLayer.color)
        if (!newLayer) {
          rejectLayer(new Error('Failed to create layer'))
          return
        }

        // Update layer properties
        newLayer.name = savedLayer.name
        newLayer.visible = savedLayer.visible
        newLayer.order = savedLayer.order

        // Create canvas for layer
        const layerCanvas = document.createElement('canvas')
        const dimensions = store.currentDimensions
        layerCanvas.width = dimensions.width
        layerCanvas.height = dimensions.height

        // Load layer image
        const img = new Image()
        img.onload = () => {
          const ctx = layerCanvas.getContext('2d')
          if (!ctx) {
            rejectLayer(new Error('Could not get layer canvas context'))
            return
          }

          ctx.clearRect(0, 0, layerCanvas.width, layerCanvas.height)
          ctx.drawImage(img, 0, 0, layerCanvas.width, layerCanvas.height)

          // Store the canvas
          store.setLayerCanvas(newLayer.id, layerCanvas)

          resolveLayer()
        }
        img.onerror = () => {
          rejectLayer(new Error(`Failed to load layer ${savedLayer.name}`))
        }
        img.src = savedLayer.canvasData
      })
    })

    // Wait for all layers to load
    Promise.all(layerPromises)
      .then(() => {
        // Set active layer to the first one
        if (store.layers.length > 0) {
          store.setActiveLayer(store.layers[0].id)
        }

        // Composite layers to main canvas and capture history
        const ctx = canvas.getContext('2d')
        if (ctx) {
          // Clear main canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height)

          // Composite all layers
          store.sortedLayers.forEach(layer => {
            if (layer.visible && layer.canvas) {
              ctx.drawImage(layer.canvas, 0, 0)
            }
          })

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          store.clearHistory()
          store.pushHistory(imageData)
        }

        resolve()
      })
      .catch(reject)
  }

  /**
   * Load a legacy drawing (v1.0.0) - convert to single layer
   */
  function loadLegacyDrawing(
    drawing: SavedDrawing,
    canvas: HTMLCanvasElement,
    resolve: () => void,
    reject: (error: Error) => void
  ): void {
    const img = new Image()
    img.onload = () => {
      // Clear existing layers and create a single layer
      store.clearLayers()
      const layer = store.addLayer('#000000')

      if (!layer || !layer.canvas) {
        reject(new Error('Failed to create layer for legacy drawing'))
        return
      }

      const layerCtx = layer.canvas.getContext('2d')
      if (!layerCtx) {
        reject(new Error('Could not get layer context'))
        return
      }

      // Draw the image onto the layer canvas
      layerCtx.clearRect(0, 0, layer.canvas.width, layer.canvas.height)
      layerCtx.drawImage(img, 0, 0, layer.canvas.width, layer.canvas.height)

      // Composite to main canvas
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(layer.canvas, 0, 0)

      // Capture history after loading from library
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      store.clearHistory()
      store.pushHistory(imageData)

      resolve()
    }
    img.onerror = () => {
      reject(new Error('Failed to load drawing image'))
    }
    img.src = drawing.canvasData
  }

  /**
   * Delete a drawing from library
   */
  function deleteDrawing(id: string): void {
    const drawings = listDrawings()
    const filtered = drawings.filter(d => d.id !== id)
    saveToStorage(filtered)
  }

  /**
   * Rename a drawing
   */
  function renameDrawing(id: string, newName: string): void {
    const drawings = listDrawings()
    const drawing = drawings.find(d => d.id === id)
    if (drawing) {
      drawing.name = newName.trim() || generateDefaultName()
      saveToStorage(drawings)
    }
  }

  /**
   * Download a drawing as PNG
   */
  function downloadDrawing(drawing: SavedDrawing): void {
    const link = document.createElement('a')
    link.download = `${drawing.name}.png`
    link.href = drawing.canvasData
    link.click()
  }

  /**
   * Save drawings array to localStorage
   */
  function saveToStorage(drawings: SavedDrawing[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(drawings))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        alert('Storage quota exceeded. Please delete some drawings to free up space.')
      }
    }
  }

  return {
    saveDrawing,
    listDrawings,
    loadDrawing,
    deleteDrawing,
    renameDrawing,
    downloadDrawing,
    generateDefaultName
  }
}
