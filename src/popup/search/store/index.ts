import { defineStore } from 'pinia';
import { windowStorage } from '@/windowStorage';

export interface TmdbState {
  tmdb_id: string;
  poster_path: string | null;
  title: string;
  media_type: string;
  release_date: string;
  vote_average: number;
}

export interface OpensubtitlesState {
  websiteLink: string;
  rating: string;
  format: string;
  languageName: string;
}

export const useStore = defineStore('search', {
  state: () => {
    return {
      inSelectionTmdb: null as TmdbState | null,
      tmdb: null as TmdbState | null,
      openSubtitle: null as OpensubtitlesState | null
    }
  },
  actions: {
    selectOpenSubtitle(payload: OpensubtitlesState){
      this.tmdb = this.inSelectionTmdb;
      this.inSelectionTmdb = null;
      this.openSubtitle = payload
    },
    setTmdbInSelection(payload: TmdbState) {
      this.inSelectionTmdb = payload;
      this.tmdb = null;
      this.openSubtitle = null;
    }
  },
  getters: {
    releaseYear: (state) => state.tmdb?.release_date.substring(0, 4) ?? null,
    tmdbLink: (state) => `https://www.themoviedb.org/${state.tmdb?.media_type}/${state.tmdb?.tmdb_id}`
  },
  persist: {
    key: 'search',
    storage: windowStorage
  }
});