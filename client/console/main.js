requirejs.config({
    baseUrl: 'js/console',
    wrapShim: true,
    shim: {
        underscore: {
            exports: '_'
        },
        bootstrap : {
            deps: [ 'jquery' ]
        },
        backbone : {
            deps: [ 'underscore' ],
            exports : 'Backbone'
        },
        backgrid : {
            deps: [ 'jquery', 'backbone', 'underscore' ],
            exports: 'Backgrid'
        },
        "backgrid/select-all": {
            deps: [ 'backgrid' ]
        },
        "backgrid/paginator": {
            deps: [ 'backgrid', 'backbone-pageable' ]
        },
        "backgrid/filter": {
            deps: [ 'backgrid', "lunr" ]
        },
        "backgrid/select2-cell": {
            deps: [ 'backgrid', 'select2' ]
        }
    },
    paths: {
        /*
         * requirejs modules
         */
        json: '../../lib/requirejs-plugins/src/json',
        text: '../../lib/requirejs-plugins/lib/text',
        /*
         * bower modules
         */
        jquery: '../../lib/jquery/dist/jquery',
        bootstrap: '../../lib/bootstrap/dist/js/bootstrap',
        backbone: '../../lib/backbone/backbone',
        "backbone-pageable": '../../lib/backbone-pageable/lib/backbone-pageable.min',
        underscore: '../../lib/underscore/underscore-min',
        backgrid: '../../lib/backgrid/lib/backgrid.min',
        "backgrid/select-all": '../../lib/backgrid-select-all/backgrid-select-all.min',
        "backgrid/paginator": '../../lib/backgrid-paginator/backgrid-paginator',
        "backgrid/filter": '../../lib/backgrid-filter/backgrid-filter.min',
        "backgrid/select2-cell": '../../lib/backgrid-select2-cell/backgrid-select2-cell.min',
        "select2": '../../lib/select2/select2.min',
        "lunr": '../../lib/lunr.js/lunr.min',
        /*
         * modules copied in by Grunt from node_modules
         */
        jade: '../../lib/jade/runtime'
    }
});

require([
    'app'
], function(App) {
    App();
});
