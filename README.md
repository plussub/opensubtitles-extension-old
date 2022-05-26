<div align="center">
<img width="130" height="125" src="https://github.com/plussub/opensubtitles-extension/blob/master/src/res/icons/logo128.png?raw=true">
</div>


# Open Subtitles
[![build and deploy](https://github.com/plussub/opensubtitles-extension/actions/workflows/build.yml/badge.svg)](https://github.com/plussub/opensubtitles-extension/actions/workflows/build.yml)

> is a browser extension which adds subtitle to HTML `<video>` tags via file or subtitle search powered by [open subtitles](https://opensubtitles.org) & [tmbd](https://www.themoviedb.org/)

### [Chrome Web Store](https://chrome.google.com/webstore/detail/gbagdbjhcmodnokmjfhkhagnhgmmpgan)

![Chrome Web Store](https://img.shields.io/chrome-web-store/stars/gbagdbjhcmodnokmjfhkhagnhgmmpgan?color=%233c3c3c)
![Chrome Web Store](https://img.shields.io/chrome-web-store/users/gbagdbjhcmodnokmjfhkhagnhgmmpgan?color=%233c3c3c)

### [Firefox Add-On](https://addons.mozilla.org/en-US/firefox/addon/opensubtitles/)
![Mozilla Add-on](https://img.shields.io/amo/stars/opensubtitles?color=%233c3c3c)
![Mozilla Add-on](https://img.shields.io/amo/users/opensubtitles?color=%233c3c3c)


### Feature list
![format](https://img.shields.io/badge/format-.vtt_.srt_.ssa_.ass-3c3c3c) <br>
![add subtitle](https://img.shields.io/badge/add_subtitle_via-file--dialog_file--dropzone_search-3c3c3c) <br>
![transcript](https://img.shields.io/badge/transcript-jump--to--timepoint_copy--subtitle--with--shift--left--click_highlight--current--showed--subtitle-3c3c3c) <br>
![subtitle customizing](https://img.shields.io/badge/subtitle_customizing-offset--time_font--size_font--color_background--color_position-3c3c3c) <br>
![search features](https://img.shields.io/badge/search_features-hearing--impaired--filter_episode--filter_season--filter-3c3c3c) <br>

### Install local build in Chrome
```
# install dependencies
npm install
npm run gen

# build chrome (dev)
npm run start:chrome
```

1) Type in Chrome address bar: `chrome://extensions/`
2) Activate developer mode
3) Load unpacked extension...
4) Select `root-folder/dist-chrome`

### Install local build in Firefox
```
# install dependencies
npm install
npm run gen

# build firefox (dev)
npm run start:firefox
```

1) Type in Firefox address bar: `about:debugging`
2) Click "This Firefox"
3) Load Temporary Add-on...
4) Select `root-folder/dist-firefox`


### Test pages
[Simple test page](https://plussub-test-page.netlify.app/)

[Test page with iframes](https://plussub-test-iframe.netlify.app/)

### [Discord](https://discord.gg/sEEeu5r9Nb) 
![Discord](https://img.shields.io/discord/761820390254706709?color=%233c3c3c)

