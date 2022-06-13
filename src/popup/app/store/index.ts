import { defineStore } from 'pinia'
import { windowStorage } from '@/windowStorage';
import { EXTENSION_ORIGIN } from '@/types';

export const useStore = defineStore('app', {
  state: () => {
    return {
      state: 'NONE' as 'NONE' | 'SELECTED' | 'DOWNLOADING' | 'PARSING' | 'ERROR' | 'DONE',
      src: 'NONE' as 'NONE' | 'FILE' | 'SEARCH'
    }
  },
  actions: {
    close(){
      document.getElementById(`${EXTENSION_ORIGIN}Shadow`)?.remove();
    }
  },
  persist: {
    key: 'app',
    storage: windowStorage
  },
})