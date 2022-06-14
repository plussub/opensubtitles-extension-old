<template>
  <PageLayout :content-transition-name="contentTransitionName">
    <template #toolbar>
      <Toolbar has-back>
        <a class="self-center pr-4" :title="[`left click - jump to time point`, `shift + left click - copy text to clipboard`].join('\n')">
          <FontAwesomeIcon icon="question-circle" class="h-icon hover:text-on-primary-hover-500"></FontAwesomeIcon>
        </a>
      </Toolbar>
    </template>
    <template #content>
      <div class="w-full h-full grid relative justify-center transcript-content--container">
        <div style="grid-area: bar" class="pt-3 pb-2 bg-primary-50 flex justify-end">
          <span class="px-4 font-medium">{{ videoStore.currentTimeAs("mm:ss") }}</span>
        </div>
        <div style="grid-area: loading" class="flex items-end flex-wrap bg-primary-50 shadow-md">
          <LoadingBar class="w-full" />
        </div>
        <TranscriptContent style="grid-area: entries"></TranscriptContent>
      </div>
    </template>
  </PageLayout>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import PageLayout from '@/components/PageLayout.vue';
import LoadingBar from '@/components/LoadingBar.vue';
import TranscriptContent from '@/subtitle/components/TranscriptContent.vue';
import Toolbar from '@/Toolbar/Toolbar.vue';
import FontAwesomeIcon from '@/components/FontAwesomeIcon/FontAwesomeIcon.vue';
import { useStore as useVideoStore } from '@/video/store';
// todo: move stuff to store
export default defineComponent({
  components: {
    FontAwesomeIcon,
    Toolbar,
    PageLayout,
    LoadingBar,
    TranscriptContent
  },
  props: {
    contentTransitionName: {
      type: String as PropType<string>,
      required: false,
      default: ''
    }
  },
  setup() {
    const videoStore = useVideoStore();
    return {
      videoStore
    };
  }
});
</script>

<style scoped>
.transcript-content--container {
  min-height: 300px;
  max-height: 500px;
  grid-template-areas:
    'bar'
    'loading'
    'entries';
  grid-template-rows: auto 8px 1fr;
  grid-template-columns: 1fr;
}
</style>
