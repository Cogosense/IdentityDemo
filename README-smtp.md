## SMTP Configuration ##

SMTP services are provided by nodemailer and the nodemailer smtp plugin. The nodemailer SMTP options
can be set in the _./config/<cfgfile> under the __"smtp"__ key.

The options are listed here, but are copied from the nodemailer documentation.

<pre>
SMTP configuration options:
port                 is the port to connect to (defaults to 25 or 465)
host                 is the hostname or IP address to connect to
                     (defaults to 'localhost')
secure               defines if the connection should use SSL (if true)
                     or not (if false)
auth                 defines authentication data (see authentication sections
                     below)
ignoreTLS            turns off STARTTLS support if true
name                 optional hostname of the client, used for identifying to
                     the server
localAddress         is the local interface to bind to for network connections
connectionTimeout    how many milliseconds to wait for the connection to establish
greetingTimeout      how many milliseconds to wait for the greeting after
                     connection is established
socketTimeout        how many milliseconds of inactivity to allow
debug                if true, the connection emits all traffic between client
                     and server as 'log' events
authMethod           defines preferred authentication method, eg. 'PLAIN'
tls                  defines additional options to be passed to the socket
                     constructor, eg. { rejectUnauthorized: true} }

Authentication options:
auth is the authentication object
auth.user            is the username
auth.pass            is the password for the user
auth.xoauth2         is the OAuth2 access token (preferred if both pass
                     and xoauth2 values are set) or an XOAuth2 tokens
                     generator object.)

If you do not want to specify the hostname, port and security settings for
a well known service, you can use it by its name (case insensitive)

service              well known service name
                             '1und1'
                             'AOL'
                             'DynectEmail'
                             'FastMail'
                             'GandiMail'
                             'Gmail'
                             'Godaddy'
                             'GodaddyAsia'
                             'GodaddyEurope'
                             'hot.ee'
                             'Hotmail'
                             'iCloud'
                             'mail.ee'
                             'Mail.ru'
                             'Mailgun'
                             'Mailjet'
                             'Mandrill'
                             'Naver'
                             'Postmark'
                             'QQ'
                             'QQex'
                             'SendCloud'
                             'SendGrid'
                             'SES'
                             'Yahoo'
                             'Yandex'
                             'Zoho'
</pre>
