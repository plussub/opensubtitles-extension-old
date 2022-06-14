import { defineStore } from 'pinia';
import { useStore as useVideoStore, Video } from '@/video/store';
import { useStore as useFileStore } from '@/file/store';
import { useStore as useSubtitleStore } from '@/subtitle/store';
import { useStore as useSearchStore } from '@/search/store';
import { useStore as useAppStore } from '@/app/store';

export const useStore = defineStore('homeStore', {
  actions: {
    async removeResult(){
      const videoStore = useVideoStore();

      await videoStore.removeCurrent();
      useAppStore().$reset();
      useFileStore().$reset();
      useSearchStore().$reset();
      useSubtitleStore().$reset();
      videoStore.removeHighlight();
    },
    async setCurrentVideo({ video }: { video: Video }){
      await useVideoStore().setCurrent({video});
    },
    highlightCurrentVideo(){
      useVideoStore().highlightCurrent();
    },
    highlightVideo({ video }: { video: Video }){
      useVideoStore().highlight({ video });
    },
    removeHighlightFromVideo(){
      useVideoStore().removeHighlight()
    },
  },
  getters: {
    loading: () => useAppStore().state !== 'DONE',
    error: () => useAppStore().state === 'ERROR',
    tmbdResult: () => useSearchStore().tmdb,
    openSubtitleResult: () => useSearchStore().openSubtitle,
    tmdbLink: () => useSearchStore().tmdbLink,
    releaseYear: () => useSearchStore().releaseYear,
    currentTimeAs (){
      return (fmt) => useVideoStore().currentTimeAs(fmt)
    },
    filenameResult: () => useFileStore().filename,
    videoList: () => useVideoStore().list
  }
});