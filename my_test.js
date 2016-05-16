var servicenow = require('servicenow');
var config = {
    instance: 'https://dev24882.service-now.com/',
    username: 'admin',
    password: 'Abc@123.'
};
var client = new servicenow.Client(config);
client.getRecords("sys_update_preview_problem", "remote_update_set=33b5da724fb94200380f3879b110c7bc", function(error, result) {
    if (!error) {
        var data = result.records;
        var logs = "";
        data.forEach(function(element) {
            logs += element.description;
        }, this);
        console.log(logs);
    }
});