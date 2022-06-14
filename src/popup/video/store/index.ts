import { computed, ComputedRef, onUnmounted, ref } from 'vue';
import { SubtitleEntry } from '@/subtitle/store';
import { mergeMap, takeUntil, tap } from 'rxjs/operators';
import { merge, Subject, interval } from 'rxjs';
import { useStore as useContentScriptStore } from '@/contentScript/store';
import { useStore as useAppearanceStore } from '@/appearance/store';
import { defineStore } from 'pinia';
import { Duration } from 'luxon';

export interface Video {
  id: string;
  hasSubtitle: boolean;
  origin: string;
  lastTimestamp: string;
  status: "none" | "selected" | "injected"
}

export interface VideoStore {
  actions: {
    setCurrent: (payload: { video: Pick<Video, 'id'> }) => Promise<unknown>;
    removeCurrent: () => Promise<unknown>;
    addVtt: (payload: { subtitles: SubtitleEntry[]; subtitleId: string; language: string }) => void;
    setTime: (payload: { time: number }) => void;
    highlight: (payload: { video: Pick<Video, 'id'> | null }) => void;
    removeHighlight: () => void;
  };
  getters: {
    current: ComputedRef<Video | null>;
    list: ComputedRef<Video[]>;
    count: ComputedRef<number>;
    videoName: ComputedRef<string>;
  };
}
const tick = async () => new Promise(resolve => setTimeout(() => resolve(undefined)));

export const useStore = defineStore('video', {
  state: () => {
    return {
      videos: {} as Record<string, Video>,
      unmountSubject: new Subject<undefined>(),
      initialized: false
    }
  },
  actions: {
    async initialize() {
      const videoUpdateIntervalObservable = interval(300).pipe(
        mergeMap(() =>
          useContentScriptStore().sendCommandWithResponse(
            { contentScriptInput: 'FIND_VIDEOS_REQUEST' },
            (responses) => responses.reduce((acc, cur) => ({ ...acc, ...cur.data.videos }), {})
          )
        ),
        tap(videos => this.setVideos(videos)),
      );

      merge(
        this.unmountSubject,
        videoUpdateIntervalObservable
      ).pipe(takeUntil(this.unmountSubject)).subscribe()

      this.initialized = true;
    },
    unmount() {
      this.unmountSubject.next(undefined);
    },
    setVideos(videos: Record<string, Video>){
      this.videos = videos;
    },
    async setCurrent ({ video: { id } }: { video: Pick<Video, 'id'> }) {
      useContentScriptStore().sendCommand({ contentScriptInput: 'SELECT_VIDEO', id });
      return tick();
    },
    async removeCurrent () {
      useContentScriptStore().sendCommand({ contentScriptInput: 'DESELECT_VIDEO' });
      return tick();
    },
    async addVtt ({ subtitles, subtitleId, language }: { subtitles: SubtitleEntry[]; subtitleId: string; language: string }) {
      const video = Object.values<Video>(this.videos).find((v) => v.status === 'selected' || v.status === 'injected');
      if (!video) {
        return tick();
      }
      const appearanceStore = useAppearanceStore();
      await appearanceStore.applyStyle();

      useContentScriptStore().sendCommand({
        contentScriptInput: 'ADD_SUBTITLE',
        video: {
          id: video.id
        },
        subtitle: {
          id: subtitleId,
          entries: JSON.parse(JSON.stringify(subtitles)),
          language
        }
      });
      return tick();
    },
    setTime ({ time }: { time: number }) {
      const video = Object.values<Video>(this.videos).find((v) => v.status === 'selected' || v.status === 'injected');
      if (!video) {
        console.warn('setTime: current video not found');
        return;
      }
      useContentScriptStore().sendCommand({
        contentScriptInput: 'SET_TIME',
        id: video.id,
        time
      });
    },
    highlight({ video }: { video: Pick<Video, 'id'> | null }): void {
      if (!video) {
        console.warn('highlight: video not found');
        return;
      }
      useContentScriptStore().sendCommand({
        contentScriptInput: 'HIGHLIGHT_VIDEO',
        id: video.id
      });
    },
    highlightCurrent() {
      this.highlight({video: this.current})
    },
    removeHighlight (){
      useContentScriptStore().sendCommand({ contentScriptInput: 'REMOVE_HIGHLIGHT_FROM_VIDEO' })
    }
  },
  getters: {
    current() {
      return Object.values<Video>(this.videos).find((v) => v.status === 'selected' || v.status === 'injected') ?? null
    },
    currentTime() {
      return parseInt(this.current ?.lastTimestamp ?? '0', 10)
    },
    currentTimeAs() {
      return (fmt: string) => Duration.fromMillis(this.currentTime).toFormat(fmt)
    },
    list() {
      return Object.values<Video>(this.videos).sort((a, b) => a.id.localeCompare(b.id));
    },
    count: (state) => Object.keys(state.videos).length,
    //todo move to own store
    videoName:  () => {
      const REGEX_JAPANESE = /[\u3000-\u303f]|[\u3040-\u309f]|[\u30a0-\u30ff]|[\uff00-\uff9f]|[\u4e00-\u9faf]|[\u3400-\u4dbf]/;
      const REGEX_CHINESE = /[\u4e00-\u9fff]|[\u3400-\u4dbf]|[\u{20000}-\u{2a6df}]|[\u{2a700}-\u{2b73f}]|[\u{2b740}-\u{2b81f}]|[\u{2b820}-\u{2ceaf}]|[\uf900-\ufaff]|[\u3300-\u33ff]|[\ufe30-\ufe4f]|[\uf900-\ufaff]|[\u{2f800}-\u{2fa1f}]/u;
      const REGEX_SPECIAL_CHAR = /^(.*?)[ (（[0-9_ ：第-]/;

      switch (window.location.hostname) {
        case 'www.youtube.com':
          return document.title.replace(' - YouTube', '');
        case 'vimeo.com':
          return document.title.replace(' on Vimeo', '');
        case 'flixtor.to':
          return document.querySelector('.watch-header.h4.mb-0.font-weight-normal.link.hidden-sm-down')?.firstChild?.textContent?.trim() ?? '1';
        default:
          if (REGEX_JAPANESE.test(document.title[0]) || REGEX_CHINESE.test(document.title[0])) {
            const nameRegexResult = REGEX_SPECIAL_CHAR.exec(document.title);
            if (nameRegexResult && nameRegexResult[1]) return nameRegexResult[1].replace(/(合集|DVD版|(国|粤)语)/, '');
          }
          return document.title;
      }
    }
  }
})
