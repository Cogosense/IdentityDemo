define([
    'jquery',
    'backbone',
    './backgridExt',
    'popup',
    'alert',
    'util',
    '../templates/show_token',
    'backgrid/select-all', // not exposed just loaded for Backgrid
    'backgrid/paginator', // not exposed just loaded for Backgrid
    'backgrid/filter', // not exposed just loaded for Backgrid
    'backgrid/select2-cell' // not exposed just loaded for Backgrid
],
function($, Backbone, Backgrid, popup, alert, util, Templates) {

    var columns = [ {
        name: '_id',
        editable: false,
        renderable: false,
        cell: 'string'
    },
    {
        name: 'name',
        label: 'Permission Name',
        tooltip: 'A unique name for the permission',
        cell: Backgrid.UniqueStringCell
    },
    {
        name: 'description',
        label: 'Permission Description',
        tooltip: 'A meaningful description of the permission',
        cell: Backgrid.SafeStringCell
    },
    {
        name: 'delete',
        label: 'Delete',
        cell: Backgrid.DeleteCell
    }];

    function init() {

        /**
         * Set up the permission-table
         */
        var Permission = Backbone.Model.extend({
            idAttribute: '_id',
            parse: function(data, options){
                /*
                 * already parsed by collection?
                 */
                if(options.collection) return data;
                /*
                 * else this is a server response
                 */
                return data.data;
            },
            initialize: function () {
                Backbone.Model.prototype.initialize.apply(this, arguments);
                this.on("change", function (model, options) {
                    if (options && options.save === false) return;
                    model.save();
                });
            },
            validate: function(attrs, options) {
                var msg;
                if(!attrs.name || attrs.name.length === 0)
                    msg = "A permission name is required and must only use alphanumeric, underscore, dot or dash characters";

                if(!attrs.description || attrs.description.length === 0)
                    msg = 'A permission description is required and may use any character except "[]@<>!?~&#*\\|{}"';

                if(msg) {
                    alert.err('Validation Error', msg, 10000);
                    return msg;
                }
                msg = "The permission was saved";
                alert.ok('Validation Success', msg, 10000);
            }
        });

        var PageablePermissions = Backbone.PageableCollection.extend({
            model: Permission,
            url: function() {
                return "/permission";
            },
            state: {
                pageSize: 15
            },
            mode: "client",
            parse: function(response) {
                return response.data;
            }
        });

        var pageablePermissions = new PageablePermissions();

        // setup the grid to display the permission
        var pageableGrid = new Backgrid.Grid({
            columns: columns.concat([ {
                // enable the select-all extension
                name: "",
                cell: "select-row",
                headerCell: "select-all"
            } ]),
            collection: pageablePermissions,
            emptyText: "No Permission Data Available",
        });

        // Render the grid
        var $permission = $("#permission-table");
        $permission.append(pageableGrid.render().el);

        // Initialize the paginator
        var paginator = new Backgrid.Extension.Paginator({
          collection: pageablePermissions
        });

        // Render the paginator
        $permission.after(paginator.render().el);

        // Initialize a client-side filter to filter on the client
        // mode pageable collection's cache.
        var filter = new Backgrid.Extension.ClientSideFilter({
            collection: pageablePermissions,
            fields: ['name']
        });

        // Render the filter
        $permission.before(filter.render().el);

        // Add some space to the filter and move it to the right
        $(filter.el).css({float: "right", margin: "20px"});

        // Fetch some data
        pageablePermissions.fetch({reset: true});
        $('body').data('permissions', pageablePermissions);

        /**
         * Let user save the selected permission
         */
        $('#add-permission').on('click', function() {
            var permission = new Permission({
                name: "<permission name>",
                description: "<Provide a meaningful description>"
            });

            pageableGrid.insertRow([permission]);
        });

        /**
         * Let user delete the selected permission
         */
        $('#delete-permission').on('click', function() {
            var selectedModels = pageableGrid.getSelectedModels();
            for (var i = 0; i < selectedModels.length; i++) {
               selectedModels[ i].destroy();
            }
        });
    }

    return {
        init : init
    };
});
