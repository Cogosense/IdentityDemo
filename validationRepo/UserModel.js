define([
    '/validator/UniqueStringInCollection',
    '/validator/FirstNameLastNameNotEmpty'
],
function(UniqueStringInCollection, FirstNameLastNameNotEmpty) {
    return {
        name: 'UserModel',
        validator: function(model){
            var errs = [];
            var msg;

            msg = UniqueStringInCollection.validator('username', model);
            if(msg)
                errs.push(msg);

            msg = FirstNameLastNameNotEmpty.validator('firstName', model);
            if(msg)
                errs.push(msg);

            msg = FirstNameLastNameNotEmpty.validator('lasttName', model);
            if(msg)
                errs.push(msg);

            return errs.length ? errs : null;
        }
    };
});


