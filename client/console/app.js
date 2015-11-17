// Bootstrap is stuck at the end because it does not need an object, but it must
// be loaded for the pages to work
define([
       'jquery',
       'backgrid',
       'permission',
       'role',
       'user',
       'profile',
       'popup',
       'alert',
       'bootstrap'
],
function($, Backgrid, permission, role, user, profile, popup, alert) {
    return function() {
        // delay initialization of the app until the DOM is fully loaded
        $(function() {

            permission.init();
            role.init();
            user.init();
            profile.init();

        }).ajaxError(function( event, jqxhr, settings, thrownError ) {
            console.log("ajax error");
            if(jqxhr.responseJSON)
                alert.rest_err(jqxhr.responseJSON.result);
            else
                popup.err(jqxhr.statusText + " (" + jqxhr.status + ")", jqxhr.responseText);
        } );
    };
});
