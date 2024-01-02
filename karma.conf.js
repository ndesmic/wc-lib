// Karma configuration
// Generated on Wed Jan 23 2019 21:49:41 GMT-0800 (Pacific Standard Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      //files to test
      { pattern: 'qr-code/wc-qr-code.js', type: "module", included: false },
      { pattern: 'qr-code/galois-field.js', type: "module", included: false },
      { pattern: 'qr-code/array-canvas.js', type: "module", included: false },
      { pattern: 'qr-code/qr-canvas.js', type: "module", included: false },
      { pattern: 'qr-code/canvas-utils.js', type: "module", included: false },
      { pattern: 'qr-code/utils.js', type: "module", included: false },
      { pattern: 'qr-code/wc-qr-code-tests.js', type: "module" },
      { pattern: 'qr-code/galois-field-tests.js', type: "module" },
      { pattern: 'qr-code/qr-canvas-tests.js', type: "module" },
      { pattern: 'qr-code/array-canvas-tests.js', type: "module" },
      { pattern: 'qr-code/utils-tests.js', type: "module" },
    ],


    // list of files / patterns to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeHeadless'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
