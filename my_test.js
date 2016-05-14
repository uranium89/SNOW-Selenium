 var assert = require('assert'),
     fs = require('fs'),
     test = require('selenium-webdriver/testing'),
     webdriver = require('selenium-webdriver')
 var driver = new webdriver.Builder().usingServer().withCapabilities({
     'browserName': 'firefox'
 }).build();
 var webdriver = require('selenium-webdriver'),
     By = webdriver.By,
     until = webdriver.until;

 const mochaTimeOut = 30000; //ms
 
test.describe('Ralph Says', function() {
  this.timeout(mochaTimeOut);
  test.it('shows a quote container', function () {
  
    driver.get('http://ralphsays.github.io');
    driver.isElementPresent(webdriver.By.id('quote')).then(function(present) {
      assert.equal(present, true, "Quote container not displayed");
    });
    driver.quit();
  });
});