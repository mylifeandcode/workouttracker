// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

// The purpose of this file is to provide Karma configuration for use with Continuous Integration 
// on the build server.
// This config file imports the configuration from karma.conf.js, and can then make changes/additions
// required for CI.
// See this URL for more info on this approach: 
// https://stackoverflow.com/questions/47266951/karma-config-including-other-config-files

const baseConfig = require('./delete-karma.conf.js');

// Import settings from default config file
var properties = null;
baseConfig({ set: function(arg) { properties = arg; } });

// Alter settings here:
properties.colors = true; //Setting this to false gives a clear indication that this config was used
properties.singleRun = true;
properties.autoWatch = false;
properties.browsers = ['ChromeHeadlessCI']; //https://angular.io/guide/testing#configure-cli-for-ci-testing-in-chrome
properties.customLaunchers = {
  ChromeHeadlessCI: {
    base: 'ChromeHeadless',
    flags: ['--no-sandbox']
  }
};

//Commented this out but leaving it here as a useful example from the URL mentioned above
//properties.reporters.push('teamcity');

//TODO: Add code coverage report
//properties.coverageIstanbulReporter.reports.push('cobertura');

// export settings
module.exports = function (config) {
  config.set(properties);
};