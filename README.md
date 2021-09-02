# IdentityDemo Management Portal

## Introduction

### Identity Management
The identity management portal demonstrates the use of MongoDB, passport, express and
backbone to implement an onboarding portal with the following features:

1. Signup
2. Email address verification
3. Account activation
4. Login
5. Lost password retrival
6. Administrative functions

### Business Rules
The identity management portal also demonstrates the use of require.js to load table schema
and validation rules.

Table schemata are kept in a mongodb collection and business rules are stored as JS functions
in the validationRepo (in this implementation they are JS files, in a production implementation
the validationRepo would be implemented with GIT and NodeGIT).

The client depends on the necessary schema to force download with requirejs. The schema is then
parsed for validation function names which are then used to create dynamic dependencies, forcing
the validation rules to be downloaded before the app starts.

## Role

1. Create accounts for customers
2. Create permissions for authorization checks
3. Create roles (as groups of permissions) that are assigned to accounts

## Technology

The database is MongoDB, the server is implemented in NodeJS and the client app is implemented using javascript, jQuery, Bootstrap and backbone

## Prerequisites

### On centos7

    yum install nodejs npm mongodb mongodb-server

### On MacOSX

Obtain the latest nodeJS release from https://nodejs.org/download/ and follow the instructions to install.

Use MacPorts to install mongodb 

    port install mongodb

If MacPorts is not already installed, follow the instructions at https://www.macports.org/install.php to install MacPorts.

## Organization

bin    - this directory contains the server app loader www
certs  - this directory contains SSL certs for https
client - this directory contains the client side code which is copied by grunt to the public directory in order to be served by the express app.
config - this directory contains the environment specific config files 
server - this directory contains the server side code
validationRepo - this directory contains the business rules as code snippets (in production this would be a GIT repo)

## Developing

Install NodeJS and MongoDB on the development machine first.

1. Change directory to the checked out repo

    `cd ../IdentityDemo`

2. Make the database directory

    `mkdir data`

3. in a seperate terminal run MongoDB

    `mongod --dbpath=$PWD/data`

4. Install the node dependencies

    `npm install`

5. Install the client side dependencies

    `bower install`

6. Build and start the browser client

    `grunt dev`

Grunt will monitor the _./client_ directory for changes and copy them to the _./public_ directory. The
__livereload__ plugin for browsers is supported, so if it is installed the browser will be
updated everytime the _./public_ directory is updated.

7. In a seperate terminal run the IdentityDemo app

    `nodemon -w server ./bin/www`

Node monitor will watch for changes in the files under the ./server directory and restart the app
on changes.

9. Refresh the browser manually if necessary to display the login page. You should also be able
to connect the livereload client now.

