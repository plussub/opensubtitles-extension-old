<template>
  <div style="grid-template-columns: auto 1fr; grid-column-gap: 0.5rem" class="grid w-full leading-relaxed">
    <div class="font-medium">Filename</div>
    <div>{{ fileStore.filename }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore as useFileStore } from '@/file/store';

export default defineComponent({
  setup() {
    return {
      fileStore: useFileStore()
    };
  }
});
</script>
