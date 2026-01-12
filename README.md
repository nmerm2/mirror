# Mirror Drawing App

A web-based drawing application that creates symmetrical patterns using polygons, circles, and rectangles.

## What It Does

This app allows you to draw shapes that are automatically mirrored across vertical and horizontal axes to create symmetrical patterns. All drawings are raster-based (pixel-based), meaning shapes become permanent pixels once drawn and cannot be individually edited or moved.

## Features

- Three canvas sizes: 4:3 landscape (3200x2400), 3:4 portrait (2400x3200), and 1:1 square (2800x2800)
- Three drawing tools: polygon, circle, and rectangle
- Four mirror modes: none, horizontal, vertical, and quad (all four quadrants)
- Zoom and pan controls for detailed work
- Optional grid overlay with snap-to-grid functionality
- Import images (rasterized to canvas)
- Export drawings as PNG files
- Color options: black (draw) and white (erase)

## User Guide

### Drawing Tools

- **Polygon**: Click to place points. Click near the first point or double-click to close the shape. Press Escape to cancel.
- **Circle**: Click and drag from center to set radius.
- **Rectangle**: Click and drag to define dimensions.

### Controls

- **Canvas**: Select canvas size (4:3 landscape, 3:4 portrait, or 1:1 square). Changing size clears the canvas with confirmation.
- **Mirror**: Select symmetry mode (none, horizontal, vertical, quad)
- **Color**: Choose black or white
- **Lines**: Toggle visibility of mirror axis indicators
- **Grid**: Set grid size (50px, 100px, 200px), toggle visibility, enable snapping
- **Zoom**: Use mouse wheel, +/- buttons, or 1x to reset
- **Pan**: Hold Shift and drag, or use middle mouse button
- **Clear**: Erase entire canvas (requires confirmation)
- **Import**: Load an image file
- **Export**: Save drawing as PNG

## Running Locally

### Prerequisites

- Node.js (version 18.x or higher recommended)
- pnpm

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm run dev
```

The app will be available at http://localhost:3000

### Production Build

```bash
pnpm run build
pnpm run preview
```

### Static Site Generation

```bash
pnpm run generate
```

### Linting

```bash
pnpm exec eslint .
```

## Technical Details

- Built with Nuxt 4 and Vue 3
- TypeScript with full type safety
- State management with Pinia
- Uses HTML5 Canvas for drawing
- Styled with Tailwind CSS v4
- Composition API with `<script setup>`
- Server-side rendering (SSR) capable
- Canvas sizes:
  - Landscape: 3200x2400 pixels (4:3 aspect ratio)
  - Portrait: 2400x3200 pixels (3:4 aspect ratio)
  - Square: 2800x2800 pixels (1:1 aspect ratio)

## Project Structure

```
app/
├── assets/
│   └── css/
│       └── main.css          # Tailwind imports + custom styles
├── components/
│   ├── CanvasContainer.vue   # Canvas wrapper with transform handling
│   ├── ControlPanel.vue      # Sidebar controls
│   ├── controls/             # Individual control components
│   └── overlays/             # Grid and mirror line overlays
├── composables/
│   ├── useCoordinateTransform.ts  # Screen-to-canvas coordinate mapping
│   ├── useFileOperations.ts       # Export/import PNG logic
│   └── useZoomPan.ts              # Zoom and pan functionality
├── pages/
│   └── index.vue             # Main drawing application page
├── stores/
│   └── drawing.ts            # Pinia store for drawing state
└── app.vue                   # Root component
```
