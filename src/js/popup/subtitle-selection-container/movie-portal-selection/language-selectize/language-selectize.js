/**
 * Created by sonste on 28.12.2016.
 */
Polymer({

    is: 'language-selectize',
    behaviors: [tms.ServiceChannelBehavior, tms.MetaChannelBehavior, tms.ChannelBasedInitializeBehavior],
    properties: {
        currentSelected: {
            type: Object,
            value: () => {
            },
            observer: '_currentSelectedChanged'
        },
    },

    channelBasedInit : {
        type:tms.MetaChannelBehavior,
        topic:"selected_subtitle_language.entry",
    },

    _channelBasedInitCallback : function(language){
        var languageAsString = JSON.stringify(language);
        this.$.languageSelection.addOption(Object.assign({}, language, {valueField: languageAsString}));
        this.$.languageSelection.addItem(languageAsString);
    },

    ready: function () {
        this.async(() => {
            this.$.languageSelection.load(iso639LanguageList);
        });
    },

    _currentSelectedChanged: function (language) {
        "use strict";

        if (!language || Object.keys(language).length===0) {
            this.servicePublish({
                topic: srtPlayer.ServiceDescriptor.SERVICE.META.SUB.FULL_TOPIC_RESET,
                data: 'selected_subtitle_language'
            });
            return;
        }

        this.metaPublish({
            topic: 'selected_subtitle_language.entry',
            data:language
        });
    }
});