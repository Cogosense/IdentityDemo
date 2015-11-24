define([
    'jquery',
    'backbone',
    'backgridExt',
    'popup',
    'alert',
    'backgrid/select-all', // not exposed just loaded for Backgrid
    'backgrid/paginator', // not exposed just loaded for Backgrid
    'backgrid/filter', // not exposed just loaded for Backgrid
    'backgrid/select2-cell' // not exposed just loaded for Backgrid
],
function($, Backbone, Backgrid, popup, alert) {

    function init() {

        var User = Backbone.Model.extend({
            idAttribute: '_id',
            parse : function(data, options) {
                /*
                 * Already parsed by collection?
                 */
                if(options.collection) return data;
                /*
                 * else server response to create
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
            validate: function(attrs, options){
                var modelValidator = Backgrid.tables.users.validator;

                var msgs = Backgrid.validators[modelValidator](this);

                if(msgs) {
                    alert.err('Validation Error',
                              '<ul><li>' + msgs.join('<li>') + '</ul>',
                              15000);
                    return msgs;
                }
                alert.ok('Validation Ok',
                         'User successfully validated',
                         5000);
            }
        });

        var PageableUsers = Backbone.PageableCollection.extend({
            model: User,
            url: function() {
                return "/user";
            },
            state: {
                pageSize: 15
            },
            mode: "client", // page entirely on the client side
            parse : function(response) {
                return response.data;
            }
        });

        var pageableUsers = new PageableUsers();

        var columns = Backgrid.tables.users.columns;
        // Set up a grid to use the pageable collection
        var pageableGrid = new Backgrid.Grid({
            columns: columns.concat([ {
                // enable the select-all extension
                name: "",
                cell: "select-row",
                headerCell: "select-all"
            }]),
            collection: pageableUsers,
            emptyText: "No User Data Available"
        });

        // Render the grid
        var $userTable = $("#user-table");
        $userTable.append(pageableGrid.render().el);

        // Initialize the paginator
        var paginator = new Backgrid.Extension.Paginator({
          collection: pageableUsers
        });

        // Render the paginator
        $userTable.after(paginator.render().el);

        // Initialize a client-side filter to filter on the client
        // mode pageable collection's cache.
        var filter = new Backgrid.Extension.ClientSideFilter({
          collection: pageableUsers,
          fields: ['username', 'firstName', 'lastName']
        });

        // Render the filter
        $userTable.before(filter.render().el);

        // Add some space to the filter and move it to the right
        $(filter.el).css({float: "right", margin: "20px"});

        // Fetch some data
        pageableUsers.fetch({reset: true});
        $('body').data('users', pageableUsers);

        $('#add-user').on('click', function() {
            var user = new User({
                 username: '<username@example.com>',
                 firstName: '<FirstName>',
                 lastName: '<LastName>',
            });
            pageableGrid.insertRow([ user ]);
         });

         /*
          * Let user delete the selected Users
          */
        $('#delete-user').on('click', function() {
            var selectedModels = pageableGrid.getSelectedModels();
            for (var i = 0; i < selectedModels.length; i++) {
                  selectedModels[i].destroy();
            }
         });
    }

    return {
        init: init
    };
});
