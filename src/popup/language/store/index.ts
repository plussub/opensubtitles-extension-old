import { defineStore } from 'pinia';
import { get as storageGet, set as storageSet } from 'storage';
import languageList from '@/res/iso639List.json';

export interface ISO639 {
  iso639_2: string;
  iso639Name: string;
}

export const useStore = defineStore('language', {
  state: () => {
    return {
      preferredLanguage: 'en',
      initialized: false
    }
  },
  actions: {
    async initialize() {
      const {preferredLanguage} = await storageGet(['preferredLanguage']);
      this.preferredLanguage = preferredLanguage;
      this.initialized = true;
    },
    async setPreferredLanguage(preferredLanguage: string){
      this.preferredLanguage = preferredLanguage;
      await storageSet({ preferredLanguage });
    }
  },
  getters: {
    preferredLanguageAsIso639: (state): ISO639 =>
      languageList.find((e) => e.iso639_2 === state.preferredLanguage) ?? {
        iso639_2: 'en',
        iso639Name: 'English'
      }
  }
})