import { defineStore } from 'pinia';
import { windowStorage } from '@/windowStorage';
import { SubtitleFormat } from '@/subtitle/store';

export const useStore = defineStore('file', {
  state: () => {
    return {
      filename: ''
    }
  },
  getters: {
     getFormatFromFilename(){
       return (filename: string): SubtitleFormat | null => {
         switch (true) {
           case /\.(ass)$/.test(filename):
             return '.ass';
           case /\.(ssa)$/.test(filename):
             return '.ssa';
           case /\.(vtt)$/.test(filename):
             return '.vtt';
           case /\.(srt)$/.test(filename):
             return '.srt';
           default:
             return null;
         }
       }
     }
  },
  persist: {
    key: 'file',
    storage: windowStorage
  }
});