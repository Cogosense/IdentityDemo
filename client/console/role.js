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

    // Setup a multi select cell type for permissions
    var PermissionSelect = Backgrid.Extension.Select2Cell.extend({
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: function() {
            var permissions = $('body').data('permissions');
            var values = permissions.map(function(permission) {
                return [ permission.get('name'), permission.get('_id')];
            });
            var options = {
                name: "Permissions",
                values: values
            };
            return [options];
        },
    });

    var columns = [ {
        name: '_id',
        editable: false,
        renderable: false,
        cell: 'string'
    },
    {
        name: 'name',
        label: 'Role Name',
        tooltip: 'A unique name for the role',
        cell: Backgrid.UniqueStringCell
    },
    {
        name: 'description',
        label: 'Role Description',
        tooltip: 'A meaningful description of the role',
        cell: Backgrid.SafeStringCell
    },
    {
        name: 'permissions',
        label: 'Role Permissions',
        cell: PermissionSelect.extend({ multiple: true })
    },
    {
        name: 'delete',
        label: 'Delete',
        cell: Backgrid.DeleteCell
    }];

    function init() {

        /**
         * Set up the role-table
         */
        var Role = Backbone.Model.extend({
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
                    msg = "A role name is required and must only use alphanumeric, underscore, dot or dash characters";

                if(!attrs.description || attrs.description.length === 0)
                    msg = 'A role description is required and may use any character except "[]@<>!?~&#*\\|{}"';

                if(msg) {
                    alert.err('Validation Error', msg, 10000);
                    return msg;
                }
                msg = "The role was saved";
                alert.ok('Validation Success', msg, 10000);
            }
        });

        var PageableRoles = Backbone.PageableCollection.extend({
            model: Role,
            url: function() {
                return "/role";
            },
            state: {
                pageSize: 15
            },
            mode: "client",
            parse: function(response) {
                return response.data;
            }
        });

        var pageableRoles = new PageableRoles();

        // setup the grid to display the roles
        var pageableGrid = new Backgrid.Grid({
            columns: columns.concat([ {
                // enable the select-all extension
                name: "",
                cell: "select-row",
                headerCell: "select-all"
            } ]),
            collection: pageableRoles,
            emptyText: "No Role Data Available",
        });

        // Render the grid
        var $roleTable = $("#role-table");
        $roleTable.append(pageableGrid.render().el);

        // Initialize the paginator
        var paginator = new Backgrid.Extension.Paginator({
          collection: pageableRoles
        });

        // Render the paginator
        $roleTable.after(paginator.render().el);

        // Initialize a client-side filter to filter on the client
        // mode pageable collection's cache.
        var filter = new Backgrid.Extension.ClientSideFilter({
            collection: pageableRoles,
            fields: ['name']
        });

        // Render the filter
        $roleTable.before(filter.render().el);

        // Add some space to the filter and move it to the right
        $(filter.el).css({float: "right", margin: "20px"});

        // Fetch some data
        pageableRoles.fetch({reset: true});
        $('body').data('roles', pageableRoles);

        /**
         * Let user save the selected role
         */
        $('#add-role').on('click', function() {
            var role = new Role({
                name: "<role name>",
                description: '<Provide a meaningful description>',
                permissions: [  ]
            });

            pageableGrid.insertRow([role]);
        });

        /**
         * Let user delete the selected role
         */
        $('#delete-role').on('click', function() {
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
