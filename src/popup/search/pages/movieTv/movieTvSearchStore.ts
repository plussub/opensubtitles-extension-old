import { defineStore } from 'pinia';
import { useStore as useVideoStore } from '@/video/store';
import { useStore as useFileStore } from '@/file/store';
import { useStore as useAppStore } from '@/app/store';
import { useStore as useSubtitleStore } from '@/subtitle/store';
import { useStore as useTrackStore } from '@/track/store';
import { TmdbState, useStore as useSearchStore } from '@/search/store';
import { asyncScheduler, from, merge, Subject } from 'rxjs';
import { map, switchMap, takeUntil, tap, throttleTime } from 'rxjs/operators';
import { searchQuery, VideoSearchQuery, VideoSearchResultEntry } from '@/search/pages/movieTv/searchQuery';

export const useStore = defineStore('movieTvSearchStore', {
  state: () => {
    return {
      unmountSubject: new Subject<undefined>(),
      searchQuerySubject: new Subject<string>(),
      loading: true,
      entries: [] as VideoSearchResultEntry[]
    };
  },
  actions: {
    initialize() {
      const searchQueryObservable = this.searchQuerySubject.pipe(
        map((q: string) => q.trim()),
        tap(() => (this.loading = true)),
        throttleTime(750, asyncScheduler, { trailing: true, leading: true }),
        switchMap((query: string) =>
          query !== ''
            ? from(searchQuery({ query }))
            : from(Promise.resolve({ videoSearch: { entries: [] }, query: '' }))
        ),
        tap((result: VideoSearchQuery & { query: string }) => {
          this.loading = false;
          this.entries = result.videoSearch.entries;
        })
      );

      merge(
        this.unmountSubject,
        searchQueryObservable,
        this.searchQuerySubject
      ).pipe(takeUntil(this.unmountSubject)).subscribe();
    },
    unmount() {
      this.unmountSubject.next(undefined);
    },
    triggerQuery(query: string) {
      this.searchQuerySubject.next(query);
    },
    selectEntry(tmdb: TmdbState) {
      const searchStore = useSearchStore();
      searchStore.setTmdbInSelection({
        tmdb_id: tmdb.tmdb_id,
        media_type: tmdb.media_type,
        poster_path: tmdb.poster_path ?? null,
        release_date: tmdb.release_date ?? '',
        title: tmdb.title,
        vote_average: tmdb.vote_average ?? 0
      });
    },
    highlightCurrentVideo() {
      useVideoStore().highlightCurrent();
    },
    removeHighlightFromVideo() {
      useVideoStore().removeHighlight();
    },
    async removeCurrentSelectedVideo() {
      await useVideoStore().removeCurrent();
    },
    async loadFile({ filename, result }: { filename: string, result: string }) {
      const fileStore = useFileStore();
      const appStore = useAppStore();
      const subtitleStore = useSubtitleStore();
      const videoStore = useVideoStore();
      const trackStore = useTrackStore();

      const resetAll = async () => {
        appStore.$reset();
        fileStore.$reset();
        subtitleStore.$reset();
        await videoStore.removeCurrent();
      };

      fileStore.$patch({ filename });
      appStore.$patch({ state: 'SELECTED', src: 'FILE' });
      const format = fileStore.getFormatFromFilename(filename);
      if (!format) {
        await resetAll();
        return;
      }
      subtitleStore.setRaw({ raw: result, format, id: filename, language: null });

      try {
        subtitleStore.parse();
      } catch (e) {
        await resetAll();
        return;
      }

      await trackStore.track({ source: 'file', language: '' });
    }
  },
  getters: {
    existsMultipleVideos: () => useVideoStore().count > 1,
    onlySingleVideo: () => useVideoStore().count === 1,
    existsVideoName: () => useVideoStore().videoName !== '',
    videoName: () => useVideoStore().videoName
  }
});