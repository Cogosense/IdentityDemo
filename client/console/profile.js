define([
    'jquery',
    'backbone',
    'popup',
    'alert',
    '../templates/profile'
],
function($, Backbone, popup, alert, Templates) {

    function profileUpdate(){
    }

    function init() {

        //$('body').data('users', pageableUsers);

        $('#user-profile-settings').on('click', function() {
            var opts = {
                message:"The password must be at least 8 characters long",
                minLen: 8,
                parent: "user-dialog-wrapper",
                user: {
                    local: {
                    }
                }
            };
            $("#user-dialog-wrapper").html(Templates.profile(opts));
            $("#user-dialog-wrapper").data("onChange", profileUpdate);
            $("#user-profile-dialog").modal({ keyboard: true });
        });
    }

    return {
        init: init
    };
});
