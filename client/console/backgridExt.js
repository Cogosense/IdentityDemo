define([
    'json!/table',
    'backgrid',
    '../templates/set_password',
    'backgrid/select-all', // not exposed just loaded for Backgrid
    'backgrid/paginator', // not exposed just loaded for Backgrid

    'backgrid/select2-cell' // not exposed just loaded for Backgrid
],
function(tables, Backgrid, Templates){

    /*
     * Add tool tips to all Backgrid header cells
     */
    Backgrid.HeaderRow = Backgrid.HeaderRow.extend({
        render: function() {
            var that = this;
            Backgrid.HeaderRow.__super__.render.apply(this, arguments);
            _.each(this.columns.models, function(modelValue) {
                if (modelValue.get('tooltip')) {
                    that.$el.find('.' + modelValue.get('name'))
                    .attr('title', modelValue.get('tooltip'))
                    .attr({ 'data-tooltip': 'tooltip'})
                    .attr({ 'data-placement': 'top'})
                    .tooltip({ container:'body' });
                }
            });
        return this;
        }
    });

    Backgrid.DeleteCell = Backgrid.Cell.extend({
        className: "button-cell",
        template: function () {
            return '<button class="btn btn-sm btn-danger"><span class="glyphicon glyphicon-remove"></span></button>';
        },
        events: {
            "click": "deleteRow",
        },
        deleteRow: function (e) {
            e.preventDefault();
            this.model.destroy();
        },
        render: function () {
            this.$el.html(this.template());
            this.delegateEvents();
            return this;
        }
    });

    Backgrid.ValidatedNumberCell = Backgrid.NumberCell.extend({
        render: function () {
            Backgrid.UniqueStringCell.__super__.render.apply(this, arguments);
            var name = this.column.get('name');
            var validator = this.column.get('validator');
            var value = this.$el.text();
            var count = this.model.collection.reduce(function(count,model){
                return count + (model.get(name) === value ? 1 : 0);
            }, 0);
            if(!/^[a-zA-Z0-9.@_-]+$/.test(value) || count > 1) {
                this.$el.addClass("bg-danger");
            } else {
                this.$el.removeClass("bg-danger");
            }
            return this;
        }
    });

    Backgrid.ValidatedStringCell = Backgrid.StringCell.extend({
        render: function () {
            Backgrid.UniqueStringCell.__super__.render.apply(this, arguments);
            var name = this.column.get('name');
            var validator = this.column.get('validator');
            var msg = Backgrid.validators[validator](name, this.model);
            if(msg) {
                this.$el.addClass("bg-danger");
                this.$el.attr({'title': msg});
                this.$el.attr({'data-tooltip': 'tooltip'});
                this.$el.attr({'data-placement': 'top'});
                this.$el.tooltip({'container': 'body'});
            } else {
                this.$el.removeClass("bg-danger");
                this.$el.removeAttr('title');
                this.$el.tooltip('destroy');
            }
            return this;
        }
    });

    Backgrid.UniqueStringCell = Backgrid.StringCell.extend({
        render: function () {
            Backgrid.UniqueStringCell.__super__.render.apply(this, arguments);
            var name = this.column.get('name');
            var value = this.$el.text();
            var count = this.model.collection.reduce(function(count,model){
                return count + (model.get(name) === value ? 1 : 0);
            }, 0);
            if(!/^[a-zA-Z0-9.@_-]+$/.test(value) || count > 1) {
                this.$el.addClass("bg-danger");
            } else {
                this.$el.removeClass("bg-danger");
            }
            return this;
        }
    });

    Backgrid.SafeStringCell = Backgrid.StringCell.extend({
        render: function () {
            Backgrid.SafeStringCell.__super__.render.apply(this, arguments);
            var name = this.column.get('name');
            var value = this.$el.text();
            if(/[\[\]@<>!?~&#*\\|{}]+/.test(value)) {
                this.$el.addClass("bg-danger");
            } else {
                this.$el.removeClass("bg-danger");
            }
            return this;
        }
    });

    // Setup a multi select cell type for roles
    Backgrid.RoleSelect = Backgrid.Extension.Select2Cell.extend({
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
    Backgrid.PasswordCell = Backgrid.Cell.extend({
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

    var tableMetaData = {};
    var validators = [];
    for(var i = 0; i < tables.length; ++i){
        var table = tables[i];

        if(table.validator)
            validators.push('/validator/' + table.validator);

        for(var j = 0; j < table.columns.length; ++j){
            var column = table.columns[j];
            switch(column.cell){
                case 'string':
                    if(column.validator) {
                        column.cell = Backgrid.ValidatedStringCell;
                    }
                    break;
                case 'number':
                    if(column.validator) {
                        column.cell = Backgrid.ValidatedNumberCell;
                    }
                    break;
                default:
                {
                    if(column.options) {
                        column.cell = Backgrid[column.cell].extend(column.options);
                        column.options = undefined;
                    } else {
                        column.cell = Backgrid[column.cell];
                    }
                }
            }
            if(column.validator)
                validators.push('/validator/' + column.validator);
        }
        tableMetaData[table.table] = {
            validator : table.validator,
            columns: table.columns
        };
    }

    Backgrid.tables = tableMetaData;
    Backgrid.validators = validators;

    console.log('table definitions: ' + JSON.stringify(Backgrid.tables));
    return Backgrid;
});
