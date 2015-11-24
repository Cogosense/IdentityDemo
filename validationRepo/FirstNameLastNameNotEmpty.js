define([], function() {
    return {
        name: 'FirstNameLastNameNotEmpty',
        validator: function(name, model){
            var msg;

            if((!model.get('firstName') || model.get('firstName').length === 0) && (!model.get('lastName') || model.get('lastName').length === 0)) {
                msg = name + ': one of first name or last name must be provided';
            }

            return msg;
        }
    };
});
