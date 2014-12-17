/*
 * grunt-ssh (partial)
 * https://github.com/andrewrjones/grunt-ssh
 *
 * Copyright (c) 2013 Andrew Jones
 * Licensed under the MIT license.
 */
exports.init = function (grunt) {
  'use strict';

  var exports = {};

  exports.validateStringArrayAndProcess = function (name, strings) {
    if (!strings) {
      grunt.warn('Missing ' + name + ' property.');
      return false;
    }
    if (grunt.util._.isFunction(strings)) {
      strings = strings(grunt);
    }
    if (grunt.util._(strings).isString()) {
      return [grunt.template.process(strings)];
    } else if (grunt.util._(strings).isArray()) {
      var processed = [];
      for (var i = 0; i < strings.length; i++) {
        var string = strings[i];
        if (!grunt.util._(string).isString()) {
          grunt.warn('The ' + name + ' property must be a string or array of strings.');
          processed = false;
          break;
        } else {
          processed.push(grunt.template.process(string));
        }
      }
      return processed;
    } else {
      grunt.warn('The ' + name + ' property must be a string or array of strings.');
      return false;
    }
  };

  exports.parseConnectionOptions = function (options) {
    var connectionOptions = {
      host: options.host,
      port: options.port,
      username: options.username,
      readyTimeout: options.readyTimeout
    };

    if (options.privateKey) {
      connectionOptions.privateKey = options.privateKey.trim();

      if (options.passphrase) {
        connectionOptions.passphrase = options.passphrase.trim();
      }
    }
    else if (options.password) {
      connectionOptions.password = options.password;
    } else {
      connectionOptions.agent = options.agent;
    }

    return connectionOptions;
  };

  return exports;
};
