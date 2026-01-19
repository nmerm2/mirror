<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  selectedColor: string
}

interface Emits {
  (e: 'update:selectedColor', color: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const showCustomPicker = ref(false)
const customColor = ref('#000000')

// Predefined color palette
const colorPalette = [
  { color: '#000000', name: 'Black' },
  { color: '#FFFFFF', name: 'White' },
  { color: '#EF4444', name: 'Red' },
  { color: '#3B82F6', name: 'Blue' },
  { color: '#10B981', name: 'Green' },
  { color: '#F59E0B', name: 'Orange' },
  { color: '#8B5CF6', name: 'Purple' },
  { color: '#EC4899', name: 'Pink' },
  { color: '#F97316', name: 'Dark Orange' },
  { color: '#06B6D4', name: 'Cyan' },
  { color: '#84CC16', name: 'Lime' },
  { color: '#A855F7', name: 'Violet' }
]

function selectColor(color: string) {
  emit('update:selectedColor', color)
  showCustomPicker.value = false
}

function selectCustomColor() {
  emit('update:selectedColor', customColor.value)
  showCustomPicker.value = false
}

function toggleCustomPicker() {
  showCustomPicker.value = !showCustomPicker.value
  if (showCustomPicker.value) {
    customColor.value = '#000000'
  }
}
</script>

<template>
  <div>
    <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Color</label>
    <div class="grid grid-cols-4 gap-1.5 px-1">
      <button
        v-for="{ color, name } in colorPalette"
        :key="color"
        :class="[
          'h-8',
          'w-full',
          'rounded',
          'border-2',
          'transition-all',
          selectedColor === color
            ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-1 scale-105'
            : 'border-gray-300 dark:border-gray-600 hover:scale-105 hover:border-gray-400'
        ]"
        :style="{ backgroundColor: color }"
        :title="name"
        @click="selectColor(color)"
      />
    </div>

    <!-- Custom Color Picker -->
    <div class="mt-2 px-1">
      <button
        class="w-full px-2 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        @click="toggleCustomPicker"
      >
        {{ showCustomPicker ? 'Cancel' : 'Custom Color' }}
      </button>

      <div v-if="showCustomPicker" class="mt-2 space-y-2">
        <input
          v-model="customColor"
          type="color"
          class="w-full h-10 rounded cursor-pointer"
        />
        <button
          class="w-full px-2 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          @click="selectCustomColor"
        >
          Apply Custom Color
        </button>
      </div>
    </div>

    <!-- Current Color Display -->
    <div class="mt-2 px-1">
      <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">Current Color:</div>
      <div
        class="w-full h-6 rounded border-2 border-gray-300 dark:border-gray-600"
        :style="{ backgroundColor: selectedColor }"
        :title="selectedColor"
      />
    </div>
  </div>
</template>
