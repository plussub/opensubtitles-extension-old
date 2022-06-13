import MovieTvSearch from "@/search/pages/movieTv/MovieTvSearch.vue";
import SubtitleSearchForMovies from "@/search/pages/subtitleForMovies/SubtitleSearchForMovies.vue";
import SubtitleSearchForSeries from "@/search/pages/subtitleForSeries/SubtitleSearchForSeries.vue";
import Transcript from "@/subtitle/pages/Transcript.vue";
import Settings from "@/settings/pages/Settings.vue";
import Home from "@/home/pages/Home.vue";
import { defineStore } from 'pinia';

export interface ToHomePayload {
  contentTransitionName: 'content-navigate-shallow' | 'content-navigate-select-to-home';
}

export interface ToSettingsPayload {
  contentTransitionName: 'content-navigate-deeper';
}

export interface ToMovieTvSearchPayload {
  contentTransitionName: 'content-navigate-deeper' | 'content-navigate-shallow';
  query?: string;
}

export interface ToSubtitleSearchPayload {
  tmdb_id: string;
  media_type: string;
  searchQuery: string;
  contentTransitionName: 'content-navigate-deeper';
}

export type ToSubtitleSearchForMoviesPayload = ToSubtitleSearchPayload
export type ToSubtitleSearchForSeriesPayload = ToSubtitleSearchPayload

export interface ToTranscriptPayload {
  contentTransitionName: 'content-navigate-deeper';
}

type ViewNames = 'HOME' | 'SETTINGS' | 'MOVIE-TV-SEARCH' | 'SUBTITLE-SEARCH-FOR-MOVIES' | 'SUBTITLE-SEARCH-FOR-SERIES' | 'TRANSCRIPT';


function to(name: 'HOME', params: ToHomePayload): void
function to(name: 'SETTINGS', params: ToSettingsPayload): void
function to(name: 'MOVIE-TV-SEARCH', params: ToMovieTvSearchPayload): void
function to(name: 'SUBTITLE-SEARCH-FOR-MOVIES', params: ToSubtitleSearchForMoviesPayload): void
function to(name: 'SUBTITLE-SEARCH-FOR-SERIES', params: ToSubtitleSearchForSeriesPayload): void
function to(name: 'TRANSCRIPT', params: ToTranscriptPayload): void
function to(name: ViewNames, params: ToHomePayload | ToSettingsPayload | ToMovieTvSearchPayload): void {
  this.name = name;
  this.params = params;
}

export const useStore = defineStore('navigation', {
  state: () => {
    return {
      name: 'HOME' as ViewNames,
      params: {} as Record<string, string>
    }
  },
  actions: {
    to
  },
  getters: {
    component: (state) => {
      if (state.name === 'MOVIE-TV-SEARCH') {
        return MovieTvSearch;
      } else if (state.name === 'SUBTITLE-SEARCH-FOR-MOVIES') {
        return SubtitleSearchForMovies;
      } else if (state.name === 'SUBTITLE-SEARCH-FOR-SERIES') {
        return SubtitleSearchForSeries;
      } else if (state.name === 'TRANSCRIPT') {
        return Transcript;
      } else if (state.name === 'SETTINGS') {
        return Settings;
      } else {
        return Home;
      }
    }
  }
});