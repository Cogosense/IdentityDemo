First Responder Tracking Application Central Server Operations Console
======================================================================

Introduction
------------

The central server application is a NodeJS application that is used to manage
the First Responder Tracking App customer base.

Role
----

1. Create accounts for operations personnel
2. Define geographic regions to subset the OSM GIS dataset into more manageable regional datasets.
3. Create and authorise Organization accounts (regional servers)
4. Associate licensed regionsal GIS datasets to organizations.

Technology
----------

The database is MongoDB, the server is implemented in NodeJS and the client app is implemented using javascript, jQuery, Bootstrap and OpenLayers3.

Prerequisites
-------------

### On centos7

    yum install nodejs npm mongodb mongodb-server

### On MacOSX

Obtain the latest nodeJS release from https://nodejs.org/download/ and follow the instructions to install.

Use MacPorts to install mongodb 

    port install mongodb

If MacPorts is not already installed, follow the instructions at https://www.macports.org/install.php to install MacPorts.

Developing
----------

Install NodeJS and MongoDB on the development machine first.

1. Checkout Tapp-cs

    `git clone https://github.com/bitbytedog/Tapp-cs.git Tapp-cs`

2. Change directory to the checked out repo

    `cd ../Tapp-cs`

3. Make the database directory

    `mkdir data`

4. in a seperate terminal run MongoDB

    `mongod --dbpath=$PWD/data`

5. Install the node dependencies

    `npm install`

6. Install the client side dependencies

    `bower install`

7. Build and start the browser client

    `grunt dev`

Grunt will monitor the _./client_ directory for changes and copy them to the _./public_ directory. The
__livereload__ plugin for browsers is supported, so if it is installed the browser will be
updated everytime the _./public_ directory is updated.

8. In a seperate terminal run the tapp=cs app

    `nodemon -w server ./bin/www`

Node monitor will watch for changes in the files under the ./server directory and restart the app
on changes.

9. Refresh the browser manually if necessary to display the login page. You should also be able
to connect the livereload client now.


Manual Installation
-------------------

Install NodeJS and MongoDB on the development machine first.

Instructions are for Centos7

1. Add a user to run the app

    `useradd -m tapp`

2. Set a password for _tapp_ and log in as _tapp_
3. Checkout LocationTracking

    `git clone https://github.com/KAT5Networks/LocationTracking.git`

4. Change directory to _tapp-cs_ and install required node modules

    `cd LocationTracking/tapp-cs && npm install && bower install && grunt production`

5. Start the app

    `npm start`

Packaging
----------

This application is packaged as part of the Tapp project.
