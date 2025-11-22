<script setup lang="ts">
import type { MirrorMode } from '~/stores/drawing'

interface Props {
  mirrorMode: MirrorMode
  showMirrorLines: boolean
}

interface Emits {
  (e: 'update:mirrorMode', mode: MirrorMode): void
  (e: 'update:showMirrorLines', show: boolean): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function updateMirrorMode(mode: MirrorMode) {
  emit('update:mirrorMode', mode)
}

function updateShowMirrorLines(show: boolean) {
  emit('update:showMirrorLines', show)
}
</script>

<template>
  <div>
    <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Mirror</label>
    <div class="flex flex-col gap-1">
      <select
        :value="mirrorMode"
        class="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
        @change="updateMirrorMode(($event.target as HTMLSelectElement).value as MirrorMode)"
      >
        <option value="none">None</option>
        <option value="vertical">Horiz</option>
        <option value="horizontal">Vert</option>
        <option value="both">Quad</option>
      </select>
      <label class="flex items-center gap-1 text-xs cursor-pointer select-none text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          :checked="showMirrorLines"
          class="cursor-pointer border-gray-300 dark:border-gray-600 focus:ring-blue-500"
          @change="updateShowMirrorLines(($event.target as HTMLInputElement).checked)"
        >
        <span>Show Lines</span>
      </label>
    </div>
  </div>
</template>
