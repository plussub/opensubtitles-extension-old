import { defineStore } from 'pinia'
import { windowStorage } from '@/windowStorage';

export const useStore = defineStore('app', {
  state: () => {
    return {
      state: 'NONE' as 'NONE' | 'SELECTED' | 'DOWNLOADING' | 'PARSING' | 'ERROR' | 'DONE',
      src: 'NONE' as 'NONE' | 'FILE' | 'SEARCH'
    }
  },
  persist: {
    key: 'app',
    storage: windowStorage
  },
})

