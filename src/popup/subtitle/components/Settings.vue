<template>
  <div>
    <div class='flex justify-around relative mt-1'>
      <slot
        name='time-settings-tab-header'
        :selected="selectedArea === 'time-settings'"
        :select="() => selectedArea = 'time-settings'">
      </slot>

      <slot
        name='appearance-settings-tab-header'
        :selected="selectedArea === 'appearance-settings'"
        :select="() => selectedArea = 'appearance-settings'">
      </slot>

      <PrefixIconButton
        icon-type='local'
        icon='caption'
        icon-size='large'
        class='py-3'
        :class="{ 'border-b-2': selectedArea === 'transcript', 'text-primary-700': selectedArea === 'transcript' }"
        @click="selectedArea = 'transcript'"
      />
      <slot
        name='info-tab-header'
        :selected="selectedArea === 'info'"
        :select="() => selectedArea = 'info'">
      </slot>
      <Divider class='absolute w-full bottom-0 border-surface-200'></Divider>
    </div>

    <div class='mx-9 mt-8'>
      <slot v-if="selectedArea === 'time-settings'" name='time-settings-tab'></slot>
      <slot v-if="selectedArea === 'appearance-settings'" name='appearance-settings-tab'></slot>
      <TranscriptPanel v-if="selectedArea === 'transcript'" />
      <slot v-if="selectedArea === 'info'" name='info-tab'></slot>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent, ref } from 'vue';
import PrefixIconButton from '@/components/PrefixIconButton.vue';
import Divider from '@/components/Divider.vue';
import TranscriptPanel from '@/subtitle/components/TranscriptPanel.vue';

export default defineComponent({
  components: {
    TranscriptPanel,
    Divider,
    PrefixIconButton
  },
  setup() {
    return {
      selectedArea: ref('time-settings')
    };
  }
});
</script>
