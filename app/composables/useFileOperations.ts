import { ref, type Ref } from 'vue'
import { useDrawingStore } from '@/stores/drawing'

export function useFileOperations(canvasEl: Ref<HTMLCanvasElement | null>) {
  const store = useDrawingStore()
  const fileInputEl = ref<HTMLInputElement | null>(null)

  function hasCanvasContent(): boolean {
    const canvas = canvasEl.value
    if (!canvas) return false

    const ctx = canvas.getContext('2d')
    if (!ctx) return false

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    return imageData.data.some((value, index) => {
      const pixelIndex = index % 4
      if (pixelIndex === 3) return false // Skip alpha
      return value !== 255
    })
  }

  function exportAsPNG() {
    const canvas = canvasEl.value
    if (!canvas) return

    let tempImageData: ImageData | null = null
    const ctx = canvas.getContext('2d')

    if (store.isDrawingPolygon && store.savedImageData && ctx) {
      tempImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      ctx.putImageData(store.savedImageData, 0, 0)
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `mirror-drawing-${Date.now()}.png`
        link.href = url
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }

      if (tempImageData && ctx) {
        ctx.putImageData(tempImageData, 0, 0)
      }
    }, 'image/png')
  }

  function importPNG() {
    fileInputEl.value?.click()
  }

  function handleFileImport(e: Event) {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, etc.)')
      return
    }

    if (hasCanvasContent()) {
      if (!window.confirm('Importing will replace your current drawing. Continue?')) {
        target.value = ''
        return
      }
    }

    if (store.isDrawingPolygon) {
      store.cancelPolygon()
    }

    const canvas = canvasEl.value
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const canvasAspect = canvas.width / canvas.height
        const imageAspect = img.width / img.height
        let drawWidth: number, drawHeight: number, drawX: number, drawY: number

        if (imageAspect > canvasAspect) {
          drawWidth = canvas.width
          drawHeight = canvas.width / imageAspect
          drawX = 0
          drawY = (canvas.height - drawHeight) / 2
        } else {
          drawHeight = canvas.height
          drawWidth = canvas.height * imageAspect
          drawX = (canvas.width - drawWidth) / 2
          drawY = 0
        }
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
      }
      img.onerror = () => alert('Failed to load image. Please try another file.')
      img.src = event.target?.result as string
    }
    reader.onerror = () => alert('Failed to read file. Please try again.')
    reader.readAsDataURL(file)

    target.value = ''
  }

  return {
    fileInputEl,
    hasCanvasContent,
    exportAsPNG,
    importPNG,
    handleFileImport
  }
}
