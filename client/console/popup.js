define([ 'jquery' ], function($) {

    //
    // Display an html success message in a popup dialog
    //
    function ok(title, html) {
        $("#dialog-ok-alert .modal-content .modal-title").html(title);
        $("#dialog-ok-alert .modal-content .modal-body").html(html);
        $("#dialog-ok-alert").modal({ keyboard: true });
    }

    //
    // Display an html success message in a popup dialog
    //
    function info(title, html) {
        $("#dialog-info-alert .modal-content .modal-title").html(title);
        $("#dialog-info-alert .modal-content .modal-body").html(html);
        $("#dialog-info-alert").modal({ keyboard: true });
    }

    //
    // Display an html success message in a popup dialog
    //
    function warn(title, html) {
        $("#dialog-warn-alert .modal-content .modal-title").html(title);
        $("#dialog-warn-alert .modal-content .modal-body").html(html);
        $("#dialog-warn-alert").modal({ keyboard: true });
    }

    //
    // Display an html error message in a popup dialog
    //
    function err(title, html) {
        $("#dialog-err-alert .modal-content .modal-title").html(title);
        $("#dialog-err-alert .modal-content .modal-body").html(html);
        $("#dialog-err-alert").modal({ keyboard: true });
    }

    //
    // Display an html error message in a popup dialog
    //
    function errJSON(response) {
        $("#dialog-err-alert .modal-content .modal-title").html('REST error ' + response.result.status + ' (internal code [' + response.result.code +'])');
        $("#dialog-err-alert .modal-content .modal-body").html('<p><strong>Problem Detected:</strong><p class="indent">' + response.result.msg + '<p><strong>Suggested Resolution:</strong><p class="indent"> ' + response.result.diag);
        $("#dialog-err-alert").modal({ keyboard: true });
    }

    return {
        ok : ok,
        info : info,
        warn : warn,
        err : err,
        errJSON : errJSON
    };
});
