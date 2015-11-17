define([
    'backgrid'
],
function(Backgrid){

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

    return Backgrid;
});
