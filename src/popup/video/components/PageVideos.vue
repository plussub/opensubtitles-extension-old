<template>
  <div class="grid py-2 h-fit videos--card">
    <div class="h-px text-2xl font-header font-medium" style="grid-area: header">
      <div>Page Videos</div>
    </div>
    <div style="grid-area: content">
      <div v-if="videoStore.list.length">
        <div
          v-for="(video, index) in videoStore.list"
          :key="index"
          style="grid-template-columns: 8px 1fr auto"
          class="grid hover:cursor-pointer video-item hover:bg-primary-700 hover:text-on-primary-700"
          @mouseenter="videoStore.highlight({ video: video })"
          @mouseleave="videoStore.removeHighlight"
          @click="selectVideo(video)"
        >
          <Divider v-if="index === 0" style="grid-column: 1/3" class="border-surface-200" />
          <div class="flex flex-col gap-1 h-11 my-2 justify-center" style="grid-column: 2 / 3">
            <div>Video {{ index + 1 }} ({{ formatTime(video.lastTimestamp, 'hh:mm:ss') }})</div>
            <div v-if="false" class="text-xs">({{ video.origin }} - {{ video.id }})</div>
          </div>
          <Divider style="grid-column: 1/3" class="border-surface-200" />
        </div>
      </div>
      <div v-else class="px-8">No videos found in current tab.</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, PropType } from 'vue';
import { Duration } from 'luxon';
import { useStore as useVideoStore, Video } from '@/video/store';

import Divider from '@/components/Divider.vue';
// todo: move stuff to store/ page
export default defineComponent({
  components: {
    Divider
  },
  props: {
    selectFn: {
      type: Function as PropType<(payload: {video: Video}) => unknown | undefined>,
      required: false,
      default: () => undefined
    }
  },
  setup(props) {
    const videoStore = useVideoStore();
    onUnmounted(() => videoStore.removeHighlight());

    return {
      videoStore,
      selectVideo: async (video: Video) => {
        await videoStore.setCurrent({ video });
        if(props?.selectFn){
          props.selectFn({video});
        }
      },
      formatTime: (ms, fmt) => Duration.fromMillis(ms).toFormat(fmt)
    };
  }
});
</script>

<style scoped>
.videos--card {
  grid-template-areas:
    '. header .'
    '. . .'
    'content content content'
    '. . .';
  grid-template-rows: 50px 4px auto 8px;
  grid-template-columns: 16px auto 16px;
}
</style>
