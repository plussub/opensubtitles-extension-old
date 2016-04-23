/**
 * Created by sonste on 01.02.2016.
 */

var srtPlayer = srtPlayer || {};
if (typeof exports !== 'undefined') {
    exports.srtPlayer = srtPlayer;
    var messageBus = null;
    srtPlayer.ServiceDescriptor = require('./../../ServiceDescriptor.js').srtPlayer.ServiceDescriptor;
    srtPlayer.MetaConfig = require('./MetaConfig.js').srtPlayer.MetaConfig;

}
/*USE DYNAMIC META CHANNEL */


srtPlayer.MetaService = srtPlayer.MetaService || ((messageBusLocal = messageBus, config = srtPlayer.MetaConfig)=> {

        var console2 = srtPlayer.LogService.getLoggerFor(srtPlayer.ServiceDescriptor.BACKEND_SERVICE.META.NAME);
        var BACKEND_SERVICE = messageBusLocal.channel(srtPlayer.ServiceDescriptor.CHANNEL.BACKEND_SERVICE);
        var META_CHANNEL = messageBusLocal.channel(srtPlayer.ServiceDescriptor.CHANNEL.META);
        var META_WRITE_CHANNEL = messageBusLocal.channel(srtPlayer.ServiceDescriptor.CHANNEL.META_WRITE);

        var topics = Object.keys(config);

        function merge(obj1, obj2) {
            for (var p in obj2) {
                obj1[p] = (typeof obj2[p] === 'object' && typeof obj1[p]==='object') ? merge(obj1[p], obj2[p]) : obj2[p]
            }
            return obj1;
        }

        function setAllSubscriberFor(current, path, init) {
            Object.keys(current).forEach(key => {
                if (typeof current[key] === 'object' && Object.keys(current[key])) {
                    setAllSubscriberFor(current[key], path + '.' + key, init);
                }
                console2.log("metaservice: subscribe to %s", path + '.' + key);
                META_WRITE_CHANNEL.subscribe({
                    topic: path + '.' + key,
                    callback: (data, envelope) => {
                        var pathWithoutRootTopic = envelope.topic.replace(init.root + '.', '').split('.');
                        var newEntry = pathWithoutRootTopic.reduce((p, c, i, a)=> {
                            var last = p;
                            while (Object.keys(last).length > 0) {
                                last = last[Object.keys(last)[0]];
                            }
                            last[c] = i < a.length - 1 ? {} : data;
                            return p;
                        }, {});
                        merge(init.data, newEntry);
                        srtPlayer.StoreService.update(init.data).then(x => META_CHANNEL.publish({
                            topic: path + '.' + key,
                            data: data
                        }));
                    }
                });
            });
        }

        var allReadyPromises = topics.map((topic)=>
            srtPlayer.StoreService.find(topic)
                .then(result => typeof result !== 'undefined' ? result :JSON.parse(JSON.stringify(config[topic].fallback)))
                .then((result)=> config[topic].current = result)
        );

        var allReadyPromises = Promise.all(allReadyPromises).then(values => {
            values.forEach(result=>
                setAllSubscriberFor(result, result.store, {
                    data: result,
                    root: result.store
                })
            );

        });

        allReadyPromises.then(()=>BACKEND_SERVICE.publish({topic: srtPlayer.ServiceDescriptor.BACKEND_SERVICE.META.PUB.READY}));

        function publish(current, path) {
            Object.keys(current).forEach(key => {
                if (typeof current[key] === 'object' && Object.keys(current[key])) {
                    publish(current[key], path + '.' + key);
                }
                META_CHANNEL.publish({
                    topic: path + '.' + key,
                    data: current[key]
                });
            });
        }

        BACKEND_SERVICE.subscribe({
            topic: srtPlayer.ServiceDescriptor.BACKEND_SERVICE.META.SUB.PUBLISH_ALL,
            callback: (topic)=>publish(config[topic].current, config[topic].fallback.store)
        });

        BACKEND_SERVICE.subscribe({
            topic: srtPlayer.ServiceDescriptor.BACKEND_SERVICE.META.SUB.RESET,
            callback:  (topic)=>srtPlayer.StoreService.update(config[topic].fallback)
                         .then(()=>merge(config[topic].current,config[topic].fallback))
                         .then((x)=>publish(config[topic].current, config[topic].fallback.store))
             });

        BACKEND_SERVICE.subscribe({
            topic: srtPlayer.ServiceDescriptor.BACKEND_SERVICE.META.SUB.PUBLISH,
            callback: (topic)=>{
                var topicPath = topic.split('.');
                META_CHANNEL.publish({
                    topic: topic,
                    data: topicPath.slice(1).reduce((p,c)=>p[c],config[topicPath[0]].current)
                });
            }
        });
        
        return {
            get: {
                user: allReadyPromises.then(()=>config.user.current),
                subtitle: allReadyPromises.then(()=>config.subtitle.current),
                option: allReadyPromises.then(()=>config.option.current)
            }
        };
    });

//instant service does not correct initialize messageBus (in testfiles)
if (typeof exports === 'undefined' && typeof srtPlayer.MetaService === 'function') {
    srtPlayer.MetaService = srtPlayer.MetaService();
}