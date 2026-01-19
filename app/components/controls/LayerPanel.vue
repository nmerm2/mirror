<script setup lang="ts">
import { useDrawingStore } from '~/stores/drawing'

const store = useDrawingStore()

function addNewLayer() {
  // Add layer with current selected color
  store.addLayer(store.color)
}

function deleteLayer(layerId: string) {
  if (store.layers.length <= 1) {
    alert('Cannot delete the last layer!')
    return
  }

  if (window.confirm('Delete this layer?')) {
    store.removeLayer(layerId)
  }
}

function selectLayer(layerId: string) {
  store.setActiveLayer(layerId)
}

function toggleVisibility(layerId: string) {
  store.toggleLayerVisibility(layerId)
}

function moveLayerUp(layerId: string) {
  const index = store.layers.findIndex(l => l.id === layerId)
  if (index < store.layers.length - 1) {
    store.reorderLayers(index, index + 1)
  }
}

function moveLayerDown(layerId: string) {
  const index = store.layers.findIndex(l => l.id === layerId)
  if (index > 0) {
    store.reorderLayers(index, index - 1)
  }
}

function changeLayerColor(layerId: string) {
  const newColor = prompt('Enter hex color (e.g., #FF0000):')
  if (newColor && /^#[0-9A-F]{6}$/i.test(newColor)) {
    store.updateLayerColor(layerId, newColor)
  } else if (newColor) {
    alert('Invalid color format. Please use hex format like #FF0000')
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-2">
      <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300">Layers</label>
      <button
        class="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
        title="Add new layer"
        @click="addNewLayer"
      >
        + Add
      </button>
    </div>

    <div class="space-y-1 max-h-64 overflow-y-auto pr-1">
      <!-- Render layers in reverse order (top layer first visually) -->
      <div
        v-for="layer in store.sortedLayers.slice().reverse()"
        :key="layer.id"
        :class="[
          'p-2',
          'rounded',
          'border',
          'transition-all',
          'cursor-pointer',
          layer.id === store.activeLayerId
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
            : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-gray-400'
        ]"
        @click="selectLayer(layer.id)"
      >
        <div class="flex items-center gap-2">
          <!-- Visibility Toggle -->
          <button
            class="flex-shrink-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            :title="layer.visible ? 'Hide layer' : 'Show layer'"
            @click.stop="toggleVisibility(layer.id)"
          >
            <svg
              v-if="layer.visible"
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          </button>

          <!-- Color Swatch -->
          <button
            class="flex-shrink-0 w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
            :style="{ backgroundColor: layer.color }"
            :title="`Change color (${layer.color})`"
            @click.stop="changeLayerColor(layer.id)"
          />

          <!-- Layer Name -->
          <div class="flex-1 text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
            {{ layer.name }}
          </div>

          <!-- Reorder Buttons -->
          <div class="flex flex-col gap-0.5">
            <button
              class="text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="layer.order === store.layers.length - 1"
              title="Move layer up"
              @click.stop="moveLayerUp(layer.id)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              class="text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="layer.order === 0"
              title="Move layer down"
              @click.stop="moveLayerDown(layer.id)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <!-- Delete Button -->
          <button
            class="flex-shrink-0 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed"
            :disabled="store.layers.length <= 1"
            title="Delete layer"
            @click.stop="deleteLayer(layer.id)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="mt-2 text-xs text-gray-500 dark:text-gray-400 px-1">
      {{ store.layers.length }} layer{{ store.layers.length !== 1 ? 's' : '' }}
    </div>
  </div>
</template>
