import { defineStore } from 'pinia';
import { SubtitleEntry, useStore as useSubtitleStore } from '@/subtitle/store';
import { useStore as useVideoStore } from '@/video/store';
import { findNext } from '@/subtitle/tab/findNext';
import { Duration } from 'luxon';

export const useStore = defineStore('transcript', {
  actions: {
    jump(entry: SubtitleEntry) {
      useVideoStore().setTime({ time: (entry.from / 1000) + 0.001 });
    },
    copy(entry: SubtitleEntry) {
      navigator.clipboard.writeText(entry.text)
    }
  },
  getters: {
    formatTime(){
      return (ms) => Duration.fromMillis(ms).toFormat('mm:ss')
    },
    entries(): SubtitleEntry[] {
      return useSubtitleStore().withOffsetParsed
    },
    currentTime() {
      return useVideoStore().currentTime;
    },
    currentSubtitlePos() {
      return findNext(this.currentTime, this.entries)
    },
  }
});