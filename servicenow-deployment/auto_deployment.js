var servicenow = require('servicenow');
var webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;

var fs = require('fs');

// webdriver will not be accessible from outside this module
var browser = new webdriver.Builder().usingServer().withCapabilities({
    'browserName': 'firefox'
}).build();

var timeout = 20000;
var delay = 1000;

exports.deploy = function(server, username, password, path) {
    var config = {
        instance: server,
        username: username,
        password: password
    };
   

    //login page
    browser.get(server + 'welcome.do').then(function() {
        console.log("login page loaded");
        //  throw new Error('my silly error');
    });
    browser.findElement(webdriver.By.id('user_name')).sendKeys(username);
    browser.findElement(webdriver.By.id('user_password')).sendKeys(password);
    browser.findElement(webdriver.By.id('sysverb_login')).click();


    //get update set
    browser.wait(function() {
        console.log("home page loaded");
        return browser.isElementPresent(webdriver.By.id('gsft_full_name'));
    }, timeout);

    //remote instance
    browser.get(server + 'sys_update_set_source_list.do');
    browser.wait(function() {
        console.log("remote instance loaded");
        return browser.isElementPresent(webdriver.By.id('sysverb_new'));
    });
    //select all instance
    browser.executeScript("document.getElementById('allcheck_sys_update_set_source').click()");

    var element = browser.findElement(webdriver.By.xpath("//select[@class='list_action_option form-control ']"));
    element.click().then(function() {
        element.findElement(webdriver.By.id("c2ca3de40a0a0b5000795879b46a69b5")).click().then(function() {
            var isPageRefresh = false;
            browser.wait(function() {
                browser.executeScript("return document.getElementById('allcheck_sys_update_set_source').checked").then(function(checked) {
                    isPageRefresh = !checked;
                });
                return isPageRefresh;
            }, timeout);
        })
    });





    browser.get(server + 'sys_remote_update_set_list.do?sysparm_query=sys_class_name%3Dsys_remote_update_set%5Estate%3Dloaded');
    browser.wait(function() {
        console.log("updated sets list loaded");
        return browser.isElementPresent(webdriver.By.id('0583c6760a0a0b8000d06ad9224a81a2'));
    }, timeout).then(function() {
        var client = new servicenow.Client(config);
        client.getRecords("sys_remote_update_set", "state=loaded", function(error, result) {
            if (!error) {
                // call succeded 
                result.records.forEach(function(item) {
                    var sys_id = item.sys_id;
                    var name = item.name;
                    var fileName = path + sys_id + "_" + name.replace(' ', '_') + ".txt";
                    var content = 'Update set committed at ' + new Date();
                    console.log(sys_id);
                    browser.get(server + 'sys_remote_update_set.do?sys_id=' + sys_id);

                    //preview update set
                    browser.executeScript("document.getElementById('preview_update_set').click()");
                    browser.sleep(timeout);
                    //preview has error
                    browser.isElementPresent(webdriver.By.id("hierarchical_progress_viewer")).then(function(result) {
                        if (result) {
                            client.getRecords("sys_update_preview_problem", "remote_update_set=" + sys_id, function(error, result) {
                                if (!error) {
                                    var data = result.records;
                                    var problems = "Update set " + name + " has error: ";
                                    data.forEach(function(element) {
                                        problems += element.description;
                                    }, this);
                                    fs.writeFile(fileName, problems, function(err) {
                                        if (err)
                                            return console.log(err);
                                        console.log(fileName);
                                    });
                                }
                            });

                        } else {
                            //show commit button
                            browser.isElementPresent(webdriver.By.id("c38b2cab0a0a0b5000470398d9e60c36")).then(function(result) {
                                if (result) {
                                    //commit update set
                                    browser.executeScript("document.getElementsByClassName('form_action_button header  action_context btn btn-default')[3].click()");
                                    browser.wait(function() {
                                        return browser.isElementPresent(webdriver.By.id("sysparm_button_close"));
                                    }, timeout);
                                    browser.findElement(webdriver.By.id("sysparm_button_close")).click();

                                    fs.writeFile(fileName, content, function(err) {
                                        if (err)
                                            return console.log(err);
                                        console.log(fileName);
                                    });
                                }
                            })
                        }
                    });

                }, this);

                browser.quit();
            }
        });
    });








}