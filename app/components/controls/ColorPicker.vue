<script setup lang="ts">
interface Props {
  selectedColor: string
}

interface Emits {
  (e: 'update:selectedColor', color: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function selectColor(color: string) {
  emit('update:selectedColor', color)
}
</script>

<template>
  <div>
    <label class="block text-xs font-semibold text-gray-700 mb-1">Color</label>
    <div class="flex gap-2 px-1">
      <button
        @click="selectColor('black')"
        :class="[
          'h-6',
          'flex-1',
          'px-1',
          'py-1',
          'border',
          'transition-all',
          selectedColor === 'black'
            ? 'bg-black text-white border-blue-500 ring-2 ring-blue-500 ring-offset-1'
            : 'bg-black text-white border-gray-300 hover:opacity-80'
        ]"
        title="Black"
      >
      </button>
      <button
        @click="selectColor('white')"
        :class="[
          'h-6',
          'flex-1',
          'px-1',
          'py-1',
          'border',
          'transition-all',
          selectedColor === 'white'
            ? 'bg-white text-black border-blue-500 ring-2 ring-blue-500 ring-offset-1'
            : 'bg-white text-black border-gray-300 hover:opacity-80'
        ]"
        title="White (Eraser)"
      >
      </button>
    </div>
  </div>
</template>
