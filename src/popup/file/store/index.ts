import { defineStore } from 'pinia';
import { windowStorage } from '@/windowStorage';

export const useStore = defineStore('file', {
  state: () => {
    return {
      filename: ''
    }
  },
  persist: {
    key: 'file',
    storage: windowStorage
  }
});