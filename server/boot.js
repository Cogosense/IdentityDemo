var debug = require('debug')('bcsaid:boot');
var express = require('express');
var fs = require('fs');
var path = require('path');

module.exports = function(parent, options){
    var passport = options.passport;
    var controllerDir = options.dir;
    var routes = options.routes;

    if(typeof routes === 'undefined')
        routes = [];

    debug("Routes: " + JSON.stringify(routes));

    // load models
    //
    var models_path = __dirname + '/models';
    var model_files = fs.readdirSync(models_path);
    model_files.forEach(function (file) {
    //     if (file == 'user.js')
    //         User = require(models_path+'/'+file)
    //           else
       require(models_path+'/'+file);
    });

    var controllerName = null;
    if(!controllerDir) {
        controllerDir = path.join(__dirname, 'controllers');
        debug('Loading client app controllers from: %s:', controllerDir);
    }
    else
        controllerName = path.basename(controllerDir);

    var controllerFound = false;

    /*
     * Load parent controller first as it may alter
     * the routing for child controllers
     */
    if(fs.existsSync(path.join(controllerDir, 'index.js'))) {
        debug("loading controller at: " + controllerDir);
        controllerFound = true;
        var obj = require(controllerDir);
        if(obj.name) {
            /*
             * Controller specified route name, affects this
             * and all children
             */
            controllerName = obj.name;
        }
        var prefix = obj.prefix || '';
        var app = express();
        var handler;
        var method;
        var routePath = routes.join('/');
        var name = controllerName;
        var route;

        // allow specifying the view engine
        if (obj.engine) app.set('view engine', obj.engine);
        app.set('views', path.join(controllerDir, '/views'));

        if (obj.init)
            obj.init(options);

        // generate routes based
        // on the exported methods
        for (var key in obj) {
            // "reserved" exports
            if (~['name', 'prefix', 'engine', 'init', 'before'].indexOf(key)) continue;
            // route exports
            switch (key) {
                case 'show':
                    method = 'get';
                    route = routePath + '/' + name + '/:' + name + '_id';
                    break;
                case 'list':
                    method = 'get';
                    route = routePath + '/' + name ;
                    break;
                case 'edit':
                    method = 'get';
                    route = routePath + '/' + name + '/:' + name + '_id/edit';
                    break;
                case 'update':
                    method = 'put';
                    route = routePath + '/' + name + '/:' + name + '_id';
                    break;
                case 'create':
                    method = 'post';
                    route = routePath + '/' + name ;
                    break;
                case 'remove':
                    method = 'delete';
                    route = routePath + '/' + name + '/:' + name + '_id';
                    break;
                case 'index':
                    method = 'get';
                    route = routePath + '/' + name ;
                    break;
                default:
                    /* istanbul ignore next */
                    throw new Error('unrecognized route: ' + name + '.' + key);
            }

            // setup
            handler = obj[key];
            route = prefix + route;

            // before middleware support
            if (obj.before) {
                app[method](route, obj.before, handler);
                debug('     %s %s -> before -> %s', method.toUpperCase(), route, key);
            } else {
                app[method](route, handler);
                debug('     %s %s -> %s', method.toUpperCase(), route, key);
            }
        }

        // mount the app
        parent.use(app);
    }

    // traverse directory tree loading child controllers
    //
    fs.readdirSync(controllerDir).forEach(function(name){
        var controllerPath = path.join(controllerDir, name);
        if(fs.lstatSync(controllerPath).isDirectory()) {
            if(!controllerFound) {
                /*
                 * treat as path extension
                 */
                debug("found path extension [" + name + "] at: " + controllerPath);
                options.dir = controllerPath;
                options.routes = routes.slice();
                options.routes.push(controllerName);
            } else {
                /*
                 * treat as child controller
                 */
                options.dir = controllerPath;
                options.routes = routes.slice();
                options.routes.push(controllerName);
                var id = ':' + controllerName + '_id';
                options.routes.push(id);
            }
            module.exports(parent, options);
        }
    });
};
