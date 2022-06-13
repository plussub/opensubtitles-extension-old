import { defineStore } from 'pinia'
import { EXTENSION_ORIGIN } from '@/types';

export const useStore = defineStore('close', {
  state: () => {
    return {
      unmountFn: () => null,
    }
  },
  actions: {
    close(){
      this.unmountFn();
      document.getElementById(`${EXTENSION_ORIGIN}Shadow`)?.remove();
    }
  }
});