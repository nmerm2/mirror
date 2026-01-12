import type { Ref } from 'vue'
import { useDrawingStore, type Point, type MosaicRotation } from '~/stores/drawing'

export interface TileInfo {
  tileX: number        // Tile column index (0-based)
  tileY: number        // Tile row index (0-based)
  localX: number       // X within tile (0 to tileWidth)
  localY: number       // Y within tile (0 to tileHeight)
  tileWidth: number    // Calculated tile width
  tileHeight: number   // Calculated tile height
  tileCenterX: number  // Absolute X center of this tile
  tileCenterY: number  // Absolute Y center of this tile
}

export function useMosaicTransform(canvasEl: Ref<HTMLCanvasElement | null>) {
  const store = useDrawingStore()

  /**
   * Calculate which tile a canvas coordinate falls into and its local position
   */
  function getTileInfo(canvasX: number, canvasY: number): TileInfo {
    const canvas = canvasEl.value
    if (!canvas) {
      return {
        tileX: 0,
        tileY: 0,
        localX: 0,
        localY: 0,
        tileWidth: 0,
        tileHeight: 0,
        tileCenterX: 0,
        tileCenterY: 0
      }
    }

    const tileWidth = canvas.width / store.mosaicTileCountX
    const tileHeight = canvas.height / store.mosaicTileCountY

    const tileX = Math.floor(canvasX / tileWidth)
    const tileY = Math.floor(canvasY / tileHeight)

    const localX = canvasX - (tileX * tileWidth)
    const localY = canvasY - (tileY * tileHeight)

    const tileCenterX = (tileX + 0.5) * tileWidth
    const tileCenterY = (tileY + 0.5) * tileHeight

    return {
      tileX,
      tileY,
      localX,
      localY,
      tileWidth,
      tileHeight,
      tileCenterX,
      tileCenterY
    }
  }

  /**
   * Generate N rotated copies of a point around a center
   */
  function getRotatedPoints(
    x: number,
    y: number,
    centerX: number,
    centerY: number,
    rotation: MosaicRotation
  ): Point[] {
    if (rotation === 'none') {
      return [{ x, y }]
    }

    const points: Point[] = []
    const N = rotation as number

    for (let i = 0; i < N; i++) {
      const angle = (2 * Math.PI * i) / N
      const rotatedX = centerX + (x - centerX) * Math.cos(angle) - (y - centerY) * Math.sin(angle)
      const rotatedY = centerY + (x - centerX) * Math.sin(angle) + (y - centerY) * Math.cos(angle)
      points.push({ x: rotatedX, y: rotatedY })
    }

    return points
  }

  /**
   * Get all transformed points (rotation + tiling) for a single canvas coordinate
   */
  function getAllTilePoints(canvasX: number, canvasY: number): Point[] {
    const canvas = canvasEl.value
    if (!canvas) return []

    const allPoints: Point[] = []
    const tileWidth = canvas.width / store.mosaicTileCountX
    const tileHeight = canvas.height / store.mosaicTileCountY

    // Calculate which tile the original point is in
    const sourceTileInfo = getTileInfo(canvasX, canvasY)

    // For each tile in the grid
    for (let tileY = 0; tileY < store.mosaicTileCountY; tileY++) {
      for (let tileX = 0; tileX < store.mosaicTileCountX; tileX++) {
        // Calculate center of this tile
        const tileCenterX = (tileX + 0.5) * tileWidth
        const tileCenterY = (tileY + 0.5) * tileHeight

        // Translate the local point to this tile's coordinate space
        const baseX = tileX * tileWidth + sourceTileInfo.localX
        const baseY = tileY * tileHeight + sourceTileInfo.localY

        // Apply rotation around this tile's center
        const rotatedPoints = getRotatedPoints(
          baseX,
          baseY,
          tileCenterX,
          tileCenterY,
          store.mosaicRotation
        )

        allPoints.push(...rotatedPoints)
      }
    }

    return allPoints
  }

  /**
   * Get all transformed point sets for an array of points (for polygons)
   */
  function getAllTilePointSets(points: Point[]): Point[][] {
    const canvas = canvasEl.value
    if (!canvas || points.length === 0) return []

    const allPointSets: Point[][] = []
    const tileWidth = canvas.width / store.mosaicTileCountX
    const tileHeight = canvas.height / store.mosaicTileCountY

    // Calculate which tile the first point is in (use as reference)
    const firstPoint = points[0]
    if (!firstPoint) return []

    const sourceTileInfo = getTileInfo(firstPoint.x, firstPoint.y)

    // For each tile in the grid
    for (let tileY = 0; tileY < store.mosaicTileCountY; tileY++) {
      for (let tileX = 0; tileX < store.mosaicTileCountX; tileX++) {
        // Calculate center of this tile
        const tileCenterX = (tileX + 0.5) * tileWidth
        const tileCenterY = (tileY + 0.5) * tileHeight

        // Apply rotation if needed
        if (store.mosaicRotation === 'none') {
          // No rotation - just translate points to this tile
          const translatedPoints = points.map((p) => {
            const tileInfo = getTileInfo(p.x, p.y)
            return {
              x: tileX * tileWidth + tileInfo.localX,
              y: tileY * tileHeight + tileInfo.localY
            }
          })
          allPointSets.push(translatedPoints)
        } else {
          // With rotation - create N rotated copies
          const N = store.mosaicRotation as number
          for (let i = 0; i < N; i++) {
            const angle = (2 * Math.PI * i) / N
            const rotatedPoints = points.map((p) => {
              const tileInfo = getTileInfo(p.x, p.y)
              const baseX = tileX * tileWidth + tileInfo.localX
              const baseY = tileY * tileHeight + tileInfo.localY

              const rotatedX =
                tileCenterX + (baseX - tileCenterX) * Math.cos(angle) - (baseY - tileCenterY) * Math.sin(angle)
              const rotatedY =
                tileCenterY + (baseX - tileCenterX) * Math.sin(angle) + (baseY - tileCenterY) * Math.cos(angle)

              return { x: rotatedX, y: rotatedY }
            })
            allPointSets.push(rotatedPoints)
          }
        }
      }
    }

    return allPointSets
  }

  return {
    getTileInfo,
    getRotatedPoints,
    getAllTilePoints,
    getAllTilePointSets
  }
}
