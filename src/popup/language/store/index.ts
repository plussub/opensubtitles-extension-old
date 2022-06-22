import { defineStore } from 'pinia';
import { get as storageGet, set as storageSet } from 'storage';
import { ContentLanguage, listContentLanguagesQuery } from '@/language/store/listContentLanguagesQuery';

export const useStore = defineStore('language', {
  state: () => {
    return {
      preferredContentLanguage: {language_code: "en", language_name: "English"} as ContentLanguage,
      contentLanguages: [] as ContentLanguage[],
      initialized: false
    }
  },
  actions: {
    async initialize() {
      const {preferredContentLanguage} = await storageGet(['preferredContentLanguage']);
      this.preferredContentLanguage = preferredContentLanguage ?? {language_code: "en", language_name: "English"};

      this.contentLanguages = (await listContentLanguagesQuery()).listContentLanguages.data;
      this.initialized = true;
    },
    async setPreferredContentLanguage(preferredContentLanguage: ContentLanguage){
      this.preferredContentLanguage = preferredContentLanguage;
      await storageSet({ preferredContentLanguage });
    },
    async resetPreferredContentLanguageToDefault() {
      return this.setPreferredContentLanguage({language_code: "en", language_name: "English"});
    }
  }
})