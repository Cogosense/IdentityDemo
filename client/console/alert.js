define([ 'jquery' ], function($) {
    //
    // Display a textual success in the alert area of screen
    //
    function ok(title, message, timeout) {
        $('#alerts').show().html('<div class="alert alert-success alert-dismissible fade in"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><span><strong>'+title+': </strong>'+message+'</span></div>');

        if (!timeout || timeout === 0) {
            timeout = 5000;
        }
        setTimeout(function() {
            $('#alerts .alert').alert('close');
        }, timeout);
    }

    //
    // Display a textual info message in the alert area of screen
    //
    function info(title, message, timeout) {
        $('#alerts').show().html('<div class="alert alert-info alert-dismissible fade in"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><span><strong>'+title+': </strong>'+message+'</span></div>');

        if (!timeout || timeout === 0) {
            timeout = 5000;
        }
        setTimeout(function() {
            $('#alerts .alert').alert('close');
        }, timeout);
    }

    //
    // Display a textual warning message in the alert area of screen
    //
    function warn(title, message, timeout) {
        $('#alerts').show().html('<div class="alert alert-warning alert-dismissible fade in"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><span><strong>'+title+': </strong>'+message+'</span></div>');

        if (!timeout || timeout === 0) {
            timeout = 5000;
        }
        setTimeout(function() {
            $('#alerts .alert').alert('close');
        }, timeout);
    }

    //
    // Display a textual error message in the alert area of screen
    //
    function err(title, message, timeout) {
        $('#alerts').show().html('<div class="alert alert-danger alert-dismissible fade in"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><span><strong>'+title+': </strong>'+message+'</span></div>');

        if (!timeout || timeout === 0) {
            timeout = 5000;
        }
        setTimeout(function() {
            $('#alerts .alert').alert('close');
        }, timeout);
    }

    //
    // Display a JSON success message in the alert area of screen
    //
    function rest_ok(success, timeout) {
        var message = "<strong>Server success (" + success.code + ")</strong>: [" + success.msg + "] " + success.diag;

        $('#alerts').show().html('<div class="alert alert-success alert-dismissible fade in"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><span>'+message+'</span></div>');

        if (!timeout || timeout === 0) {
            timeout = 5000;
        }
        setTimeout(function() {
            $('#alerts .alert').alert('close');
        }, timeout);
    }

    //
    // Display a JSON error message in the alert area of screen
    //
    function rest_err(error, timeout) {
        var message = "<strong>Server error (" + error.code + ")</strong>: [" + error.msg + "] " + error.diag;

        $('#alerts').show().html('<div class="alert alert-danger alert-dismissible fade in"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><span>'+message+'</span></div>');

        if (!timeout || timeout === 0) {
            timeout = 5000;
        }
        setTimeout(function() {
            $('#alerts .alert').alert('close');
        }, timeout);
    }

    return {
        ok : ok,
        rest_ok : rest_ok,
        info : info,
        warn : warn,
        err : err,
        rest_err : rest_err
    };
});
