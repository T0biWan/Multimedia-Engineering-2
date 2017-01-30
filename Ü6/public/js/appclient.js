/** Main application file to start the client side single page app (only a stub for Ü6)
 *
 * @author Johannes Konert
 * extended by "the Wookies": Charline Waldrich, Robert Ullmann und Philip Zuschlag
 */

requirejs.config({
    baseUrl: "/js",
    paths: {
        jquery: './_lib/jquery-1.11.3',
        underscore: './_lib/underscore-1.8.3',
        backbone: './_lib/backbone-1.2.3',
        video: './models/video',
        view: './views/video',
        listview: './views/video-list'
    },
    shim: {
        underscore: {
            exports: "_"
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        }
    }
});

// AMD conform require as provided by require.js
require(['jquery', 'backbone', 'video', 'view', 'listview'],
    function ($, Backbone, Video, View, Listview) {

        var AppRouter = Backbone.Router.extend({
            routes: {
                '': 'main',
                '*whatever': 'main'
            },
            main: function () {

                var videoCollection = new Video.Collection();
                var videoListView = new Listview({collection: videoCollection});

                videoCollection.fetch();
            }
        });

        var myRouter = new AppRouter();

        // finally start tracking URLs to make it a SinglePageApp (not really needed at the moment)
        Backbone.history.start({pushState: true}); // use new fancy URL Route mapping without #
    });
