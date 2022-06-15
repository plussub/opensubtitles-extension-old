import { defineStore } from 'pinia';
import { from, merge, Subject } from 'rxjs';
import { useStore as useAppStore } from '@/app/store';
import { useStore as useSubtitleStore } from '@/subtitle/store';
import { useStore as useTrackStore } from '@/track/store';
import { useStore as useSearchStore } from '@/search/store';
import { useStore as useLanguageStore } from '@/language/store';
import { useStore as useDownloadStore } from '@/download/store';
import { SubtitleSearchResultData } from '@/search/__gen_gql';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import {
  searchQuery,
  SubtitleSearchForMoviesQuery,
  SubtitleSearchForMoviesQueryVariables
} from '@/search/pages/subtitleForMovies/searchQuery';

export const useStore = defineStore('subtitleSearchForMoviesStore', {
  state: () => {
    return {
      unmountSubject: new Subject<undefined>(),
      searchQuerySubject: new Subject<SubtitleSearchForMoviesQueryVariables>(),
      loading: true,
      language: useLanguageStore().preferredLanguageAsIso639,
      filter: '',
      onlyHearingImpaired: false,
      entries: [] as SubtitleSearchResultData[]
    };
  },
  actions: {
    initialize() {
      const searchQueryObservable = this.searchQuerySubject.pipe(
        tap(() => (this.loading = true)),
        switchMap((variables: SubtitleSearchForMoviesQueryVariables) => from(searchQuery(variables))),
        tap((result: SubtitleSearchForMoviesQuery) => {
          this.loading = false;
          this.entries = result.subtitleSearch.data;
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
    triggerQuery(payload: SubtitleSearchForMoviesQueryVariables) {
      this.searchQuerySubject.next(payload);
    },
    async select(openSubtitle: SubtitleSearchResultData, whileDownloadingFn: () => unknown) {
      const appStore = useAppStore();
      const searchStore = useSearchStore();
      const languageStore = useLanguageStore();
      const subtitleStore = useSubtitleStore();
      const trackStore = useTrackStore();
      const downloadStore = useDownloadStore();

      appStore.$patch({ state: 'SELECTED', src: 'SEARCH' });
      await languageStore.setPreferredLanguage(this.language.iso639_2);
      searchStore.selectOpenSubtitle({
        format: openSubtitle.attributes.format ?? 'srt',
        languageName: openSubtitle.attributes.language,
        rating: openSubtitle.attributes.ratings.toString(),
        websiteLink: openSubtitle.attributes.url
      });

      whileDownloadingFn()
      const { raw, format } = await downloadStore.download(openSubtitle);

      try {
        subtitleStore.setRaw({
          raw,
          format,
          id: openSubtitle.attributes.files[0].file_name ?? '-',
          language: this.language.iso639_2
        });
        subtitleStore.parse();
      } catch (e) {
        appStore.$patch({ state: 'ERROR' });
      }
      await trackStore.track({ source: 'search-for-movie', language: this.language.iso639_2 });
    }
  },
  getters: {
    preferredLanguageAsIso639: () => useLanguageStore().preferredLanguageAsIso639,
    filteredEntries() {
      return this.entries.filter(({ attributes }) => {
        if (this.filter === '') {
          return this.onlyHearingImpaired ? attributes.hearing_impaired : true;
        }
        const intermediate = attributes.files[0].file_name?.toLowerCase().includes(this.filter.toLowerCase()) ?? false;
        return this.onlyHearingImpaired ? intermediate && attributes.hearing_impaired : intermediate;
      });
    }
  }
});