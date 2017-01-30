/**
 *  Backbone Model (stub)
 *  Connected to REST API /{ressourcepath}
 *
 *  (file can be deleted or used for Ü6 videos)
 *
 *  @author Johannes Konert
 *  extended by "the Wookies": Charline Waldrich, Robert Ullmann und Philip Zuschlag
 */
define(['backbone', 'underscore'], function(Backbone, _) {
    var result = {};

    var VideoModel = Backbone.Model.extend({
        urlRoot : '/videos',
        idAttribute: "_id",

        defaults: {
            title: '',
            src: '',
            length: 0,
            playcount: 0,
            ranking: 0,
            description: '',
            timestamp: Date.now()
        }
    });

    var VideoCollection = Backbone.Collection.extend({
        url: '/videos',
        model: VideoModel
    });

    result.Model = VideoModel;
    result.Collection = VideoCollection;
    return result;
});
