import { get as storageGet, set as storageSet } from 'storage';
import { interval, merge, Subject, tap } from 'rxjs';
import { debounce, map, takeUntil } from 'rxjs/operators';
import { EXTENSION_ORIGIN } from '@/types';
import { useStore as useContentScriptStore } from '@/contentScript/store';
import { defineStore } from 'pinia';

type Css = 'cssColor' | 'cssBackgroundColor' | 'cssFontSize';
type Cue = 'cueLine' | 'cueSnapToLines';

type SetStylePayload = Record<Css & Cue, string>;

const tick = async () => new Promise(resolve => setTimeout(() => resolve(undefined)));

export const useStore = defineStore('appearance', {
  state: () => {
    const unmountSubject = new Subject<undefined>();
    const storeStyleSubject = new Subject();
    const storeStyleObservable = storeStyleSubject.pipe(
      debounce(() => interval(200)),
      map((style) => storageSet({ style })),
      takeUntil(unmountSubject)
    )
    return {
      style: {} as SetStylePayload,
      storeStyleSubject,
      allObservables: merge(
        unmountSubject,
        storeStyleObservable,
        storeStyleSubject
      ).pipe(takeUntil(unmountSubject)),
      unmountSubject,
      initialized: false
    }
  },
  actions: {
    async initialize() {
      const { style } = await storageGet(['style']);
      console.warn(style);
      this.allObservables.subscribe();
      this.style = style ?? {};
      this.initialized = true;
    },
    unmount() {
      this.unmountSubject.next(undefined);
    },
    async setStyle(style: SetStylePayload){
      this.style = style;
      this.storeStyleSubject.next(this.style);
      await tick();
    },
    applyStyle () {
      const toCssPayload = (style: Record<Css, string> | Record<string, never>) => ({
        ...(style.cssColor ? { [`--${EXTENSION_ORIGIN}-cue-color`]: style.cssColor } : {}),
        ...(style.cssBackgroundColor ? { [`--${EXTENSION_ORIGIN}-cue-background-color`] : style.cssBackgroundColor } : {}),
        ...(style.cssFontSize ? { [`--${EXTENSION_ORIGIN}-cue-font-size`] : style.cssFontSize } : {})
      });

      const toCuePayload = (style: Record<Cue, string> | Record<string, never>) => ({
        ...(style.cueLine ? { line: style.cueLine } : {}),
        ...(style.cueSnapToLines !== undefined ? { snapToLines: style.cueSnapToLines } : {})
      });
      const contentScriptStore = useContentScriptStore();
      contentScriptStore.sendCommand({
        contentScriptInput: 'APPLY_STYLE',
        css: {
          ...toCssPayload(this.style)
        },
        cue: {
          ...toCuePayload(this.style)
        }
      });
      return tick();
    }
  },
});
