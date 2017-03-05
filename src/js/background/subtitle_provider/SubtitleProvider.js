var srtPlayer = srtPlayer || {};
if (typeof exports !== 'undefined') {
    exports.srtPlayer = srtPlayer;
    var messageBus = null;
    srtPlayer.ServiceDescriptor = require('./../../ServiceDescriptor.js').srtPlayer.ServiceDescriptor;
    var fetch = require('node-fetch');
}

srtPlayer.SubtitleProvider = srtPlayer.SubtitleProvider || (($, messageBusLocal = messageBus) => {

        var SERVICE_CHANNEL = messageBusLocal.channel(srtPlayer.ServiceDescriptor.CHANNEL.BACKEND_SERVICE);
        var SERVICE_CONST = srtPlayer.ServiceDescriptor.BACKEND_SERVICE.SUBTITLE_PROVIDER;
        // var console = srtPlayer.LogService.getLoggerFor(SERVICE_CONST.NAME);

        SERVICE_CHANNEL.subscribe({
            topic: SERVICE_CONST.SUB.SEARCH,
            callback: search
        });

        SERVICE_CHANNEL.subscribe({
            topic: SERVICE_CONST.SUB.DOWNLOAD,
            callback: download
        });

        function login() {
            let username = '';
            let password = '';

            return new Promise((resolve, reject) => {
                $.xmlrpc({
                    url: 'http://api.opensubtitles.org/xml-rpc',
                    methodName: 'LogIn',
                    params: [username, password, 'en', 'PlusSub'],
                    success: function (response, status, jqXHR) {
                        resolve(response[0].token);
                    },
                    error: function (jqXHR, status, error) {
                        console.error(error);
                        console.error(status);

                        reject(error);
                    }
                }, {}, window);
            });
        }

        /**
         * data.imdbid -> movie id from imdb
         * data.iso639 -> language code for subtitle
         * @param data
         */
        function search(data) {

            if (!data.imdbid) {
                console.log("imdbid does not exist");
                return;
            }

            if (data.imdbid.startsWith('tt')) {
                data.imdbid = data.imdbid.slice(2);
            }


            fetch('https://0e53p7322m.execute-api.eu-central-1.amazonaws.com/release/subtitle?imdbid=' + data.imdbid + '&iso639LanguageCode=' + data.iso639)
                .then(function (response) {
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' + response.status);
                        return;
                    }

                    // Examine the text in the response
                    response.json()
                        .then((data) => data.map(entry =>
                            Object.assign({}, {
                                rating: entry.SubRating,
                                movieTitle: entry.MovieName,
                                subtitleLanguage: entry.LanguageName,
                                idSubtitleFile: entry.IDSubtitleFile,
                                subtitleRating: entry.SubRating
                            }))
                        ).then(result => SERVICE_CHANNEL.publish({
                            topic: SERVICE_CONST.PUB.SEARCH_RESULT,
                            data: result
                        }));
                })
                .catch(function (err) {
                    console.log('Fetch Error :-S', err);
                });
        }

        function download(idSubtitleFile) {
            login().then((token) => new Promise((resolve, reject) =>
                $.xmlrpc({
                    url: 'http://api.opensubtitles.org/xml-rpc',
                    methodName: 'DownloadSubtitles',
                    params: [token, [idSubtitleFile]],
                    success: function (response, status, jqXHR) {
                        resolve(response[0].data[0].data);
                    },
                    error: function (jqXHR, status, error) {
                        console.error(status);
                        reject(error);
                    }
                }, {}, window)
            )).then(result => {
                var gunzipData = new Zlib.Gunzip(srtPlayer.Uint8ArrayConverter.fromString(atob(result)));
                var decompressedData = gunzipData.decompress();
                return srtPlayer.Uint8ArrayConverter.toString(decompressedData);
            }).then(result =>
                SERVICE_CHANNEL.publish({
                    topic: SERVICE_CONST.PUB.DOWNLOAD_RESULT,
                    data: result
                })
            );
        }


    });

//instant service does not correct initialize messageBus (in testfiles)
if (typeof exports === 'undefined' && typeof srtPlayer.SubtitleProvider === 'function') {
    srtPlayer.SubtitleProvider = srtPlayer.SubtitleProvider($);
}