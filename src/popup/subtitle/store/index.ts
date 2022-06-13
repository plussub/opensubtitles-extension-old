import { parse as srtVttParse } from '@plussub/srt-vtt-parser';
import { parse as assSsaParse } from './ass-ssa-parser';
import { useStore as useAppStore } from '@/app/store';
import { defineStore } from 'pinia';
import { windowStorage } from '@/windowStorage';

export interface SubtitleEntry {
  from: number;
  to: number;
  text: string;
}
export type SubtitleFormat = '.srt' | '.vtt' | '.ass' | '.ssa';

export const useStore = defineStore('subtitle', {
  state: () => {
    return {
      id: null as string | null,
      raw: null as string | null,
      language: null as string | null,
      parsed: [] as SubtitleEntry[],
      format: null as SubtitleFormat | null,
      withOffsetParsed: [] as SubtitleEntry[],
      offsetTime: 0
    };
  },
  actions: {
    setRaw({ raw, format, id, language }: {raw: string, format: SubtitleFormat, id: string, language: string|null}) {
      this.reset();
      this.id = id;
      this.raw = raw;
      this.format = format;
      this.language = language;
    },
    setOffsetTime({ offsetTime }: {offsetTime: number}){
      this.offsetTime = offsetTime;
      this.withOffsetParsed = this.parsed.map((e) => ({
        ...e,
        from: e.from + offsetTime,
        to: e.to + offsetTime
      }))
    },
    parse() {
      const appStore = useAppStore();

      appStore.$patch({ state: 'PARSING' });

      if (!this.raw || !this.format || !this.id) {
        appStore.$patch({ state: 'ERROR' });
        throw new Error('raw format or id does not exists');
      }
      try {
        this.parsed = (this.format === '.srt' || this.format === '.vtt') ? srtVttParse(this.raw).entries : assSsaParse(this.raw);
        this.withOffsetParsed = this.parsed.map((e) => ({
          ...e,
          from: e.from + this.offsetTime,
          to: e.to + this.offsetTime
        }))
        appStore.$patch({ state: 'DONE' });
      } catch (e) {
        appStore.$patch({ state: 'ERROR' });
        throw new Error('parse error');
      }
    }
  },
  persist: {
    key: 'subtitle',
    storage: windowStorage
  }
});