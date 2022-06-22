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
  searchQuery, Seasons,
  SubtitleSearchForSeriesQuery,
  SubtitleSearchForSeriesQueryVariables
} from '@/search/pages/subtitleForSeries/searchQuery';

export const useStore = defineStore('subtitleSearchForSeriesStore', {
  state: () => {
    return {
      unmountSubject: new Subject<undefined>(),
      searchQuerySubject: new Subject<SubtitleSearchForSeriesQueryVariables>(),
      loading: true,
      tmdb_id: "",
      language: useLanguageStore().preferredContentLanguage,
      filter: '',
      onlyHearingImpaired: false,
      entries: [] as SubtitleSearchResultData[],
      seasons: [] as Seasons[],
      season: 1,
      episode: 0
    };
  },
  actions: {
    initialize() {
      const searchQueryObservable = this.searchQuerySubject.pipe(
        tap(() => (this.loading = true)),
        switchMap((variables: SubtitleSearchForSeriesQueryVariables) => from(searchQuery(variables))),
        tap((result: SubtitleSearchForSeriesQuery) => {
          this.loading = false;
          this.entries = result.subtitleSearch.data;
          this.seasons = result.seasons.seasons;
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
    triggerQuery() {
      this.searchQuerySubject.next({
        language: this.language.language_code,
        tmdb_id: this.tmdb_id,
        season_number: this.season,
        episode_number: this.episode
      });
    },
    async select(openSubtitle: SubtitleSearchResultData, whileDownloadingFn: () => unknown) {
      const appStore = useAppStore();
      const searchStore = useSearchStore();
      const languageStore = useLanguageStore();
      const subtitleStore = useSubtitleStore();
      const trackStore = useTrackStore();
      const downloadStore = useDownloadStore();

      appStore.$patch({ state: 'SELECTED', src: 'SEARCH' });
      await languageStore.setPreferredContentLanguage(this.language);
      searchStore.selectOpenSubtitle({
        format: openSubtitle.attributes.format ?? 'srt',
        languageName: openSubtitle.attributes.language,
        rating: openSubtitle.attributes.ratings.toString(),
        websiteLink: openSubtitle.attributes.url
      });

      whileDownloadingFn();
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
      await trackStore.track({ source: 'search-for-movie', language: this.language.language_code });
    }
  },
  getters: {
    contentLanguages: () => useLanguageStore().contentLanguages,
    filteredEntries() {
      return this.entries.filter(({ attributes }) => {
        if (this.filter === '') {
          return this.onlyHearingImpaired ? attributes.hearing_impaired : true;
        }
        const intermediate = attributes.files[0].file_name?.toLowerCase().includes(this.filter.toLowerCase()) ?? false;
        return this.onlyHearingImpaired ? intermediate && attributes.hearing_impaired : intermediate;
      });
    },
    seasonCount() {
      return this.seasons?.length ?? 0;
    },
    episodeCount() {
      return this.seasons?.find((s) => s.season_number === this.season)?.episode_count ?? 0;
    }
  }
});