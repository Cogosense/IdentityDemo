//
// Error handling for BcsaId uses a common JSON format:
//
// {
//      "code": <unique code>,
//      "message": "<fixed error message for code>",
//      "description": "<freeform additional detailed message provided by application>"
// }


// REST errors
// { REST code, api status, http status, error msg }

// status 200:
// Handle the response
//
// status 400:
// badly formatted request, server could not understand it
//
// status 404:
// REST API not found
//
// status 500:
// system error. Here we should probably try a couple more times
// before giving up and trying again later. report error and try
// again
//
// status 601:
// no active session id, need to register again
// Start another registration in 5 minutes
//
// status 603:
// request came in over http but was expecting https
// report error (NO RETRY). this should never happen
// unless there is a bug in client logic
//
// status 604:
// Duplicate sequence number. This means that the
// message has already been processed.
// report error (NO RETRY). this should never happen
// unless there is a bug in client logic
//
// status 605:
// didn't provide a valid engine in the url
// report error (NO RETRY). this should never happen
// unless there is a bug in client logic
//
// status 606:
// invalid signature, need to register again
//
// status 607:
// system problems doing an upload
// report error and try again
//
// status 608:
// out of sequence - The message arrived but it
// came in out of sequence, need to register again
//
// status 613:
// Unknown application - the application has not been provisioned in the server
// Permanently terminate service
//
// status 614:
// Unknown subscriber - the subscriber has been removed from the system
// Permanently terminate service
//
// status 616:
// Bad credit - the subscriber has not paid his bill.
// Temporarily suspend service by removing the ADID
//
var debug = require('debug')('bcsaid:response');

var errors = [
        // 0XXX success codes
        [
            {"code": 0, "apiStatus": 200, "httpStatus": 200, "msg": "Success" },
            {"code": 1, "apiStatus": 200, "httpStatus": 201, "msg": "Created" },
            {"code": 2, "apiStatus": 200, "httpStatus": 202, "msg": "Accepted (but not completed)" },
            {"code": 3, "apiStatus": 200, "httpStatus": 203, "msg": "error code not used" },
            {"code": 4, "apiStatus": 200, "httpStatus": 204, "msg": "Deleted" },
            {"code": 5, "apiStatus": 200, "httpStatus": 500, "msg": "error code not used" }
        ],
        // 1XXX user errors
        [
            {"code": 1000, "apiStatus": 500, "httpStatus": 500, "msg": "error code not used" },
            {"code": 1001, "apiStatus": 500, "httpStatus": 422, "msg": "duplicate email address" },
            {"code": 1002, "apiStatus": 500, "httpStatus": 410, "msg": "user already removed" }
        ],

        // 2XXX session/api auth errors
        [
            {"code": 2000, "apiStatus": 500, "httpStatus": 500, "msg": "error code not used" },
            {"code": 2001, "apiStatus": 500, "httpStatus": 401, "msg": "session not found" },
            {"code": 2002, "apiStatus": 614, "httpStatus": 401, "msg": "authentication tokens invalid" },
            {"code": 2003, "apiStatus": 615, "httpStatus": 401, "msg": "user account is not active" },
            {"code": 2004, "apiStatus": 500, "httpStatus": 406, "msg": "Unsupported authentication method" }
        ],

        // 3XXX permission errors
        [
            {"code": 3000, "apiStatus": 500, "httpStatus": 500, "msg": "error code not used" },
            {"code": 3001, "apiStatus": 500, "httpStatus": 409, "msg": "duplicate permission name" },
            {"code": 3002, "apiStatus": 500, "httpStatus": 410, "msg": "permission already removed" }
        ],

        // 4XXX role  errors
        [
            {"code": 4000, "apiStatus": 500, "httpStatus": 500, "msg": "error code not used" },
            {"code": 4001, "apiStatus": 500, "httpStatus": 409, "msg": "duplicate role name" },
            {"code": 4002, "apiStatus": 500, "httpStatus": 410, "msg": "role already removed" }
        ],

        // 5XXX service  errors
        [
            {"code": 5000, "apiStatus": 500, "httpStatus": 500, "msg": "error code not used" },
            {"code": 5001, "apiStatus": 613, "httpStatus": 404, "msg": "unknown service name" },
            {"code": 5002, "apiStatus": 404, "httpStatus": 400, "msg": "unknown error occurred" }
        ]
];

module.exports = {

    respond_ok_with_data: function(res, code, description, data) {

        if(code > 1000) {
            throw{
                name: "BcsaId Error",
                message: "Success codes must be in range 0 - 999 inclusive"
            };
        }
        var suc = errors [ 0 ][ code ];
        if(!suc) {
            throw{
                name: "BcsaId Error",
                message: "Code undefined" + code
            };
        }

        var response = {
            "result": {
                "status":suc.apiStatus,
                "code":suc.code,
                "msg":suc.msg,
                "diag":description
            },
            "data": data
        };

        res.status(suc.httpStatus).json(response);
        debug('Responded OK with data: ' + JSON.stringify(response));
    },

    respond_ok: function(res, code, description) {

        if(code > 1000) {
            throw{
                name: "BcsaId Error",
                message: "Success codes must be in range 0 - 999 inclusive"
            };
        }
        var suc = errors [ 0 ][ code ];
        if(!suc){
            throw{
                name: "BcsaId Error",
                message: "Code undefined" + code
            };
        }

        var response = {
            "result": {
                "status":suc.apiStatus,
                "code":suc.code,
                "msg":suc.msg,
                "diag":description
            }
        };

        res.status(suc.httpStatus).json(response);
        debug('Responded OK with no data: ' + JSON.stringify(response));
    },

    respond_error: function(res, code, description) {

        var idx1 = Math.floor(code / 1000);
        var idx2 =code % 1000;
        var err = errors[ idx1][ idx2];
        if(!err) {
            throw{
                name: "BcsaId Error",
                message: "Error undefined" + code
            };
        }
        var response = {
            "result": {
                "status":err.apiStatus,
                "code":err.code,
                "msg":err.msg,
                "diag":description
            }
        };

        res.status(err.httpStatus).json(response);
        debug('Responded ERR with no data: ' + JSON.stringify(response));
    }

};
