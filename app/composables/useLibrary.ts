import { useDrawingStore } from '~/stores/drawing'

export interface SavedDrawing {
  id: string
  version: string
  name: string
  timestamp: number
  canvasData: string // base64 encoded PNG
  thumbnail: string // small base64 preview
  settings: {
    canvasSize: 'landscape' | 'portrait' | 'square'
    mirrorMode: 'none' | 'horizontal' | 'vertical' | 'both'
    color: 'black' | 'white'
    drawingTool: 'polygon' | 'circle' | 'square'
    showGrid: boolean
    gridSize: number
    snapToGrid: boolean
    showMirrorLines: boolean
  }
}

const STORAGE_KEY = 'mirror-drawing-library'
const CURRENT_VERSION = '1.0.0'
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
    const canvasData = canvas.toDataURL('image/png')
    const thumbnail = generateThumbnail(canvas)

    const drawing: SavedDrawing = {
      id: `drawing-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      version: CURRENT_VERSION,
      name: customName || generateDefaultName(),
      timestamp: Date.now(),
      canvasData,
      thumbnail,
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

      // Initialize canvas with new dimensions
      initializeCanvas()

      // Load image
      const img = new Image()
      img.onload = () => {
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

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
    })
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
