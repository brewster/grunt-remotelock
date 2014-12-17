/*
 * grunt-ssh (partial)
 * https://github.com/andrewrjones/grunt-ssh
 *
 * Copyright (c) 2013 Andrew Jones
 * Licensed under the MIT license.
 */

var util = require('util');

exports.init = function (grunt) {
  'use strict';

  var _ = grunt.util._;

  var exports = {};

  var defaults = exports.defaults = function () {
    return {
      config: false,
      host: false,
      username: false,
      password: false,
      agent: "",
      port: 22,
      ignoreErrors: false,
      minimatch: {},
      pty: {},
      suppressRemoteErrors: false,

      file: null,
      mode: '0664',
      grp: 'eng',
      message: null
    };
  };

  var set = exports.set = function (options, optionName) {
    var option;
    if ((!options[optionName]) && (option = grunt.option(optionName))) {
      options[optionName] = option;
    }
  };

  exports.merge = function (taskOptions, target) {
    if (!target) {
      grunt.fail.fatal('Target must be supplied (and defined in remoteLock).');
      return undefined;
    }

    grunt.config.requires(['remoteLock', target]);

    var remoteLockConfig = grunt.config.get('remoteLock');

    var options = _.extend({},
                           defaults(),
                           remoteLockConfig.options || {},
                           (remoteLockConfig[target] && remoteLockConfig[target].options) || {},
                           (taskOptions && taskOptions.options) || {},
                           (taskOptions && taskOptions[target] && taskOptions[target].options) || {});

    set(options, 'config');

    if (options.config && _(options.config).isString()) {
      grunt.config.requires(['sshconfig', options.config]);
      var configOptions = grunt.config.get(['sshconfig', options.config]);
      options = _.extend(options, configOptions);
    }

    set(options, 'username');
    set(options, 'password');
    set(options, 'passphrase');

    if (options.host.indexOf(':') !== -1) {
      var hostPair = options.host.split(':');
      options.host = hostPair[0];
      options.port = hostPair[1];
    }

    grunt.verbose.writeflags(options, 'Options');

    return options;
  };

  return exports;
};
