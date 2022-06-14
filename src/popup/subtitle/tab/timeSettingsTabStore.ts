import { defineStore } from 'pinia';
import { SubtitleEntry, useStore as useSubtitleStore } from '@/subtitle/store';
import { useStore as useVideoStore } from '@/video/store';
import { findNext } from './findNext';

export const useStore = defineStore('timeSettingsTab', {
  actions: {
    async setOffsetTime (payload: {offsetTime: number}){
      useSubtitleStore().setOffsetTime(payload)
    }
  },
  getters: {
    offsetTime: () => useSubtitleStore().offsetTime,
    currentTime() {
      return useVideoStore().currentTime;
    },
    currentSubtitlePos() {
      const subtitleStore = useSubtitleStore();
      return findNext(this.currentTime, subtitleStore.withOffsetParsed)
    },
    excerpt(): SubtitleEntry[] {
      const pos = this.currentSubtitlePos;
      if (pos === -1){
        return [];
      }
      return useSubtitleStore().withOffsetParsed.filter((e, idx) => idx >= pos && idx < pos + 3);
    },

  }
});