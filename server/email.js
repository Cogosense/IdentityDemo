var path           = require('path');
var templatesDir   = path.join(__dirname, './templates');
var emailTemplates = require('email-templates');
var nodemailer      = require('nodemailer');
var smtpTransport   = require('nodemailer-smtp-transport');

// Errors
var HomeUrlRequiredError = new Error('the home URL is required');
var EmailAddressRequiredError = new Error('email address is required');
var EmailSubjectRequiredError = new Error('email subject is required');

// sendmail options
var config = require('config');
var smtpOpts = config.get('smtp');

// email options
var config = require('config');

var transporter = nodemailer.createTransport(smtpTransport(
    smtpOpts
));


function sendOne(templateName, subject, locals, fn){
    // make sure that we have a home URL
    if (!locals.homeUrl) {
        return fn(HomeUrlRequiredError);
    }
    // make sure that we have an user email
    if (!locals.email) {
        return fn(EmailAddressRequiredError);
    }
    // make sure that we have a message
    if (!subject) {
        return fn(EmailSubjectRequiredError);
    }
    emailTemplates(templatesDir, function(err, template) {
        if(err) {
            console.log(err);
            return fn(err);
        }

        locals.supportEmailAddress = config.get('email.supportEmailAddress');

        template(templateName, locals, function(err, html, text) {

            var mailOptions = {
                to: locals.email,
                from: config.get('email.fromEmailAddress'),
                subject: subject,
                html: html,
                text: text
            };
            transporter.sendMail(mailOptions, function(err, responseStatus){
                if(err) {
                    console.log(err);
                    return fn(err);
                }
                return fn(null, responseStatus.message, html, text);
            });
        });
    });
}

exports.passwordReset = function(locals, fn) {
    sendOne('passwordReset', config.get('email.passwordResetSubject'), locals, fn);
};

exports.passwordChanged = function(locals, fn) {
    sendOne('passwordChanged', config.get('email.passwordChangedSubject'), locals, fn);
};

exports.activateAccount= function(locals, fn) {
    sendOne('activateAccount', config.get('email.activateAccountSubject'), locals, fn);
};

exports.welcome= function(locals, fn) {
    sendOne('welcome', config.get('email.welcomeSubject'), locals, fn);
};

exports.profileUpdated= function(locals, fn) {
    sendOne('profileUpdated', config.get('email.profileUpdatedSubject'), locals, fn);
};
