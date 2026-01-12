<script setup lang="ts">
import type { CanvasSize } from '~/stores/drawing'
import { useColorMode } from '#imports'

interface Props {
  canvasSize: CanvasSize
  canUndo: boolean
  canRedo: boolean
}

interface Emits {
  (e: 'save' | 'library' | 'import' | 'export' | 'clear' | 'invert' | 'undo' | 'redo'): void
  (e: 'canvas-size-change', size: CanvasSize): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const colorMode = useColorMode()

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

function handleCanvasSizeChange(size: CanvasSize) {
  emit('canvas-size-change', size)
}
</script>

<template>
  <div class="w-full bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 px-4 py-2 flex items-center justify-between">
    <!-- Left: File Operations -->
    <div class="flex items-center gap-2">
      <button
        class="px-3 py-1 bg-blue-500 text-white border border-blue-600 dark:border-blue-400 text-xs font-semibold hover:bg-blue-600 transition-all flex items-center gap-1"
        title="Save to library"
        @click="emit('save')"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
        Save
      </button>
      <button
        class="px-3 py-1 bg-blue-500 text-white border border-blue-600 dark:border-blue-400 text-xs font-semibold hover:bg-blue-600 transition-all flex items-center gap-1"
        title="Open library"
        @click="emit('library')"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 3h7v7H3z" />
          <path d="M14 3h7v7h-7z" />
          <path d="M14 14h7v7h-7z" />
          <path d="M3 14h7v7H3z" />
        </svg>
        Library
      </button>
      <button
        class="px-3 py-1 bg-gray-500 dark:bg-gray-600 text-white border border-gray-600 dark:border-gray-500 text-xs font-semibold hover:bg-gray-600 dark:hover:bg-gray-700 transition-all"
        title="Import image"
        @click="emit('import')"
      >
        Import
      </button>
      <button
        class="px-3 py-1 bg-gray-500 dark:bg-gray-600 text-white border border-gray-600 dark:border-gray-500 text-xs font-semibold hover:bg-gray-600 dark:hover:bg-gray-700 transition-all"
        title="Export as PNG"
        @click="emit('export')"
      >
        Export
      </button>

      <!-- Undo/Redo Buttons -->
      <div class="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
      <button
        class="px-3 py-1 bg-gray-500 dark:bg-gray-600 text-white border border-gray-600 dark:border-gray-500 text-xs font-semibold transition-all flex items-center gap-1"
        :class="props.canUndo ? 'hover:bg-gray-600 dark:hover:bg-gray-700' : 'opacity-40 cursor-not-allowed'"
        :disabled="!props.canUndo"
        title="Undo (Cmd+Z)"
        @click="emit('undo')"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 7v6h6" />
          <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
        </svg>
        Undo
      </button>
      <button
        class="px-3 py-1 bg-gray-500 dark:bg-gray-600 text-white border border-gray-600 dark:border-gray-500 text-xs font-semibold transition-all flex items-center gap-1"
        :class="props.canRedo ? 'hover:bg-gray-600 dark:hover:bg-gray-700' : 'opacity-40 cursor-not-allowed'"
        :disabled="!props.canRedo"
        title="Redo (Cmd+Shift+Z)"
        @click="emit('redo')"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 7v6h-6" />
          <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7" />
        </svg>
        Redo
      </button>
    </div>

    <!-- Right: Canvas Operations -->
    <div class="flex items-center gap-2">
      <!-- Canvas Size Dropdown -->
      <div class="flex items-center gap-2">
        <label class="text-xs font-semibold text-gray-700 dark:text-gray-300">Canvas:</label>
        <select
          :value="canvasSize"
          class="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
          @change="handleCanvasSizeChange(($event.target as HTMLSelectElement).value as CanvasSize)"
        >
          <option value="landscape">Landscape (4:3)</option>
          <option value="portrait">Portrait (3:4)</option>
          <option value="square">Square (1:1)</option>
        </select>
      </div>

      <!-- Clear Button -->
      <button
        class="px-3 py-1 bg-red-500 text-white border border-red-600 dark:border-red-400 text-xs font-semibold hover:bg-red-600 transition-all"
        title="Clear canvas"
        @click="emit('clear')"
      >
        Clear
      </button>

      <!-- Invert Button -->
      <button
        class="px-3 py-1 bg-gray-500 dark:bg-gray-600 text-white border border-gray-600 dark:border-gray-500 text-xs font-semibold hover:bg-gray-600 dark:hover:bg-gray-700 transition-all"
        title="Invert colors"
        @click="emit('invert')"
      >
        Invert
      </button>

      <!-- Theme Toggle -->
      <ClientOnly>
        <button
          class="px-2 py-1 border border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all flex items-center gap-1"
          :title="colorMode.value === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          @click="toggleTheme"
        >
          <svg
            v-if="colorMode.value === 'dark'"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          <svg
            v-else
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
          <span class="text-xs">{{ colorMode.value === 'dark' ? 'Light' : 'Dark' }}</span>
        </button>
      </ClientOnly>
    </div>
  </div>
</template>
