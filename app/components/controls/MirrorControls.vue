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
    <label class="block text-xs font-semibold text-gray-700 mb-1">Mirror</label>
    <select
      :value="mirrorMode"
      @change="updateMirrorMode(($event.target as HTMLSelectElement).value as MirrorMode)"
      class="w-full px-2 py-1 text-xs border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="none">None</option>
      <option value="vertical">Horiz</option>
      <option value="horizontal">Vert</option>
      <option value="both">Quad</option>
    </select>
  </div>

  <div>
    <label class="block text-xs font-semibold text-gray-700 mb-1">Lines</label>
    <label class="flex items-center gap-1 text-xs cursor-pointer select-none">
      <input
        type="checkbox"
        :checked="showMirrorLines"
        @change="updateShowMirrorLines(($event.target as HTMLInputElement).checked)"
        class="cursor-pointer border-gray-300 focus:ring-blue-500"
      />
      <span>Show</span>
    </label>
  </div>
</template>
