define([
    'jquery',
    'backbone',
    'backgridExt',
    'popup',
    'alert',
    '../templates/set_password',
    'backgrid/select-all', // not exposed just loaded for Backgrid
    'backgrid/paginator', // not exposed just loaded for Backgrid
    'backgrid/filter', // not exposed just loaded for Backgrid
    'backgrid/select2-cell' // not exposed just loaded for Backgrid
],
function($, Backbone, Backgrid, popup, alert, Templates) {

    // Setup a multi select cell type for roles
    var RoleSelect = Backgrid.Extension.Select2Cell.extend({
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: function() {
            var roles = $('body').data('roles');
            var values = roles.map(function(role) {
                return [ role.get('name'), role.get('_id')];
            });
            var options = {
                name: "Roles",
                values: values
            };
            return [options];
        },
    });

    // Password cell is a button to display a passwd change dialog
    var PasswordCell = Backgrid.Cell.extend({
        className: "button-cell",
        template: function () {
            return '<button class="btn btn-sm btn-warning"><span class="glyphicon glyphicon-lock"></span></button>';
        },
        events: {
            "click": "setPassword"
        },
        setPassword: function (e) {
            e.preventDefault();
            var passwordResult = (function(password) {
                this.model.set({ password : password});
            }).bind(this);
            var opts = {
                message:"The password must be at least 8 characters long",
                minLen: 8,
                parent: "user-dialog-wrapper"
            };
            $("#user-dialog-wrapper").html(Templates.set_password(opts));
            $("#user-dialog-wrapper").data("onChange", passwordResult);
            $("#user-passwd-dialog").modal({ keyboard: true });
        },
        render: function () {
            this.$el.html(this.template());
            this.delegateEvents();
            return this;
        }
    });

    var columns = [{
        name: '_id',
        editable: false,
        renderable: false,
        cell: 'string'
    }, {
        name: 'username',
        label: 'User Name',
        tooltip: 'This is the login id, it can be an email address, employee number or same other information unique to the employee.',
        cell: Backgrid.UniqueStringCell
    }, {
        name: 'firstName',
        label: 'First Name',
        tooltip: 'Real first name',
        cell: 'string'
    }, {
        name: 'lastName',
        label: 'Last Name',
        tooltip: 'Real last name',
        cell: 'string'
    }, {
        name: 'password',
        label: 'Password',
        tooltip: 'A random password is auto generated on adding the subscriber.  Click the button to set a password',
        cell: PasswordCell
    }, {
        name: 'roles',
        label: 'Roles',
        tooltip: 'The allowed roles for the user',
        cell: RoleSelect.extend({multiple: true})
    }, {
        name: 'delete',
        label: 'Delete',
        tooltip: 'Delete the team. The user will automatically be removed from all teams',
        cell: Backgrid.DeleteCell
    }];

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
                var msg;
                if(!/^[a-zA-Z0-9@._-]+$/.test(attrs.username)) {
                    msg = "An user name is required and must only use alphanumeric, underscore, at, dot or dash characters";
                }
                if((!attrs.firstName || attrs.firstName.length === 0) && (!attrs.lastName || attrs.lastName.length === 0)){
                    msg = "One of first name or last name must be provided";
                }
                if(msg) {
                    alert.err('Validation Error', msg, 10000);
                    return msg;
                }
                msg = "The user was saved";
                alert.ok('Validation Success', msg, 10000);
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
