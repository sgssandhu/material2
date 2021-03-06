const fs = require('fs');
const path = require('path');

// Load ts-node to be able to execute TypeScript files with protractor.
require('ts-node').register({
  project: path.join(__dirname, '../e2e/')
});


const E2E_BASE_URL = process.env['E2E_BASE_URL'] || 'http://localhost:4200';
const config = {
  useAllAngular2AppRoots: true,
  specs: [ path.join(__dirname, '../e2e/**/*.e2e.ts') ],
  baseUrl: E2E_BASE_URL,
  allScriptsTimeout: 120000,
  getPageTimeout: 120000,
  jasmineNodeOpts: {
    defaultTimeoutInterval: 120000,
  },

  plugins: [
    {
      // Runs the axe-core accessibility checks each time the e2e page changes and
      // Angular is ready.
      path: '../tools/axe-protractor/axe-protractor.js',

      rules: [
        // Exclude md-menu elements because those are empty if not active.
        { id: 'aria-required-children', selector: '*:not(md-menu)' },

        // Disable color constrast checks since the final colors will vary based on the theme.
        { id: 'color-contrast', enabled: false },
      ]
    }
  ]
};

if (process.env['TRAVIS']) {
  const key = require('../scripts/saucelabs/sauce_config');
  config.sauceUser = process.env['SAUCE_USERNAME'];
  config.sauceKey = key;
  config.capabilities = {
    'browserName': 'chrome',
    'tunnel-identifier': process.env['TRAVIS_JOB_ID'],
    'build': process.env['TRAVIS_JOB_ID'],
    'name': 'Material 2 E2E Tests',

    // Enables concurrent testing in the Webdriver. Currently runs five e2e files in parallel.
    maxInstances: 5,
    shardTestFiles: true,

    // By default Saucelabs tries to record the whole e2e run. This can slow down the builds.
    'recordVideo': false,
    'recordScreenshots': false
  };

  // Because Protractor runs selenium instances concurrently in the CI and each instance
  // will create a bloat of logs we don't want to show any info messages.
  // Until protractor#1451 is solved, manually disable all info messages.
  require('protractor/built/logger').Logger.prototype.info = () => {};
}


exports.config = config;
