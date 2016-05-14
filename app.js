var snow = require('./servicenow-deployment/auto_deployment');
var server = process.argv[2];
var username = process.argv[3];
var password = process.argv[4];
var path = process.argv[5];

snow.deploy(server, username, password, path);