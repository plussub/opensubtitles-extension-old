<template>
  <PageLayout :content-transition-name='contentTransitionName'>
    <template #toolbar>
      <Toolbar>
        <a class='self-center pr-4' @click='toSettings()'>
          <FontAwesomeIcon icon='cog' class='h-icon hover:text-on-primary-hover-500'></FontAwesomeIcon>
        </a>
      </Toolbar>

    </template>
    <template #content>
      <div
        class='flex flex-wrap h-full home-content--container'
        :class="{ 'bg-surface-100': current === 'search-card' || current === 'file-card' }">
        <ResultFromSearch
          v-if="current === 'search-card'"
          :loading="appStore.state !== 'DONE'"
          :error="appStore.state === 'ERROR'"
          :title="searchStore.tmdb?.title"
          :open-subtitles-rating="searchStore.openSubtitle?.rating"
          :open-subtitles-link="searchStore.openSubtitle?.websiteLink"
          :tmdb-votes="searchStore.tmdb?.vote_average.toString()"
          :tmdb-link="searchStore.tmdbLink"
          :poster-path="searchStore.tmdb?.poster_path"
          class='m-2'
          @remove='remove'>

          <template #hero-sub-header>
            {{
              `${capitalize(searchStore.tmdb?.media_type)} ${searchStore.releaseYear ? `/ ${searchStore.releaseYear}` : ''}`
            }}
          </template>

          <template #settings>
            <Settings>
              <template #time-settings-tab-header="{select, selected }">
                <time-settings-tab-header :selected='selected' @click="select">
                  <template #label>
                    <span>{{ videoStore.currentTimeAs('hh:mm:ss') }}</span>
                  </template>
                </time-settings-tab-header>
              </template>
              <template #time-settings-tab>
                <time-settings-tab></time-settings-tab>
              </template>

              <template #appearance-settings-tab-header="{select, selected }">
                <appearance-settings-tab-header :selected='selected' @click="select"/>
              </template>
              <template #appearance-settings-tab>
                <appearance-settings-tab></appearance-settings-tab>
              </template>

              <template #info-tab-header="{select, selected }">
                <SearchResultInfoTabHeader :selected='selected' @click="select" />
              </template>
              <template #info-tab>
                <SearchResultInfoTab
                  :format="searchStore.openSubtitle?.format"
                  :language="searchStore.openSubtitle?.languageName"
                />
              </template>
            </Settings>
          </template>

          <template #actions>
            <SuffixIconButton
              label='Highlight video'
              icon='crosshairs'
              @mouseenter='videoStore.highlightCurrent'
              @mouseleave='videoStore.removeHighlight'
            />
          </template>
        </ResultFromSearch>

        <ResultFromFile v-else-if="current === 'file-card'" class='m-2' @remove='remove'>

          <template #settings>
            <Settings>
              <template #time-settings-tab-header="{select, selected }">
                <time-settings-tab-header :selected='selected' @click="select">
                  <template #label>
                    <span>{{ videoStore.currentTimeAs('hh:mm:ss') }}</span>
                  </template>
                </time-settings-tab-header>
              </template>
              <template #time-settings-tab>
                <time-settings-tab></time-settings-tab>
              </template>

              <template #appearance-settings-tab-header="{select, selected }">
                <appearance-settings-tab-header :selected='selected' @click="select"/>
              </template>
              <template #appearance-settings-tab>
                <appearance-settings-tab></appearance-settings-tab>
              </template>

              <template #info-tab-header="{select, selected }">
                <FileInfoTabHeader :selected='selected' @click="select" />
              </template>
              <template #info-tab>
                <FileInfoTab :filename="fileStore.filename"/>
              </template>
            </Settings>
          </template>

          <template #actions>
            <SuffixIconButton
              label='Highlight video'
              icon='crosshairs'
              @mouseenter='videoStore.highlightCurrent'
              @mouseleave='videoStore.removeHighlight'
            />
          </template>
        </ResultFromFile>

        <PageVideos v-else-if="current === 'page-videos'" class='w-full' :select-fn='toSearch' />
        <Mention />
      </div>
    </template>
  </PageLayout>
</template>

<script lang='ts'>
import { computed, defineComponent, PropType } from 'vue';

import PageLayout from '@/components/PageLayout.vue';
import ResultFromSearch from '@/search/components/ResultFromSearch.vue';
import ResultFromFile from '@/file/components/ResultFromFile.vue';
import FileInfoTabHeader from '@/file/tab/FileInfoTabHeader.vue';
import FileInfoTab from '@/file/tab/FileInfoTab.vue';
import PageVideos from '@/video/components/PageVideos.vue';
import Settings from '@/subtitle/components/Settings.vue';
import SearchResultInfoTabHeader from '@/search/tab/SearchResultInfoTabHeader.vue';
import SearchResultInfoTab from '@/search/tab/SearchResultInfoTab.vue';
import Mention from '@/home/components/Mention.vue';
import Toolbar from '@/toolbar/Toolbar.vue';
import FontAwesomeIcon from '@/components/FontAwesomeIcon/FontAwesomeIcon.vue';
import { useStore as useAppStore } from '@/app/store';
import { useStore as useNavigationStore } from '@/navigation/store';
import SuffixIconButton from '@/components/SuffixIconButton.vue';
import { useStore as useVideoStore } from '@/video/store';
import { useStore as useFileStore } from '@/file/store';
import { useStore as useSubtitleStore } from '@/subtitle/store';
import { useStore as useSearchStore } from '@/search/store';
import { useStringFn } from '@/composables';
import TimeSettingsTabHeader from '@/subtitle/tab/TimeSettingsTabHeader.vue';
import TimeSettingsTab from '@/subtitle/tab/TimeSettingsTab.vue';
import AppearanceSettingsTabHeader from '@/appearance/tab/AppearanceSettingsTabHeader.vue';
import AppearanceSettingsTab from '@/appearance/tab/AppearanceSettingsTab.vue';

export default defineComponent({
  components: {
    AppearanceSettingsTab,
    AppearanceSettingsTabHeader,
    TimeSettingsTab,
    TimeSettingsTabHeader,
    FontAwesomeIcon,
    Toolbar,
    PageLayout,
    ResultFromSearch,
    ResultFromFile,
    PageVideos,
    Settings,
    SearchResultInfoTabHeader,
    SearchResultInfoTab,
    FileInfoTabHeader,
    FileInfoTab,
    Mention,
    SuffixIconButton
  },
  props: {
    contentTransitionName: {
      type: String as PropType<string>,
      required: false,
      default: ''
    }
  },
  setup() {
    const appStore = useAppStore();
    const navigationStore = useNavigationStore();
    const videoStore = useVideoStore();
    const searchStore = useSearchStore();
    const fileStore = useFileStore();
    const subtitleStore = useSubtitleStore();
    const { capitalize } = useStringFn();

    return {
      capitalize,
      appStore,
      videoStore,
      searchStore,
      fileStore,
      toSettings: () => navigationStore.to('SETTINGS', { contentTransitionName: 'content-navigate-deeper' }),
      toSearch: () => navigationStore.to('MOVIE-TV-SEARCH', { contentTransitionName: 'content-navigate-deeper' }),
      remove: async () => {
        await videoStore.removeCurrent();
        appStore.$reset();
        fileStore.$reset();
        searchStore.$reset();
        subtitleStore.$reset();
        videoStore.removeHighlight();
      },
      current: computed(() => {
        if (appStore.state !== 'NONE' && appStore.src === 'SEARCH') {
          return 'search-card';
        }
        if (appStore.state !== 'NONE' && appStore.src === 'FILE') {
          return 'file-card';
        }
        if (appStore.state === 'NONE') {
          return 'page-videos';
        }
        return 'unknown';
      })
    };
  }
});
</script>

<style scoped>
.home-content--container {
  min-height: 300px;
  max-height: 720px;
}

.home-content--container-old {
  overflow-y: scroll;
  width: 100%;
  height: 100%;
  display: grid;
  justify-content: center;
  grid-template-areas:
    'current-sub'
    'videos'
    'contribution';
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 1fr;
  row-gap: 16px;
}
</style>
