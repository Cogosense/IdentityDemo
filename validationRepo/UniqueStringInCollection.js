define([], function(){
    return {
        name: 'UniqueStringInCollection',
        validator: function(name, model){
            var msg;
            var value = model.get(name);
            var match = /[^a-zA-Z0-9.@_-]/.exec(value);
            if(match && match.length > 0) {
                msg = 'illegal character found in field: "' + match.join(' ') + '"';
            }
            var count = model.collection.reduce(function(count,model){
                return count + (model.get(name) === value ? 1 : 0);
            }, 0);
            if(count > 1){
                msg = 'Duplicate value "' + value +'" found in column';
            }
            return msg;
        }
    };
});

