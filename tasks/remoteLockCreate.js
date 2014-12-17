/*
 * grunt-remotelock
 * https://github.com/lmfr/remotelock
 *
 * Copyright (c) 2014 Luis Reis
 * Licensed under the MIT license.
 */

'use strict';

var util = require('util');

var moment = require('moment');
var Connection = require('ssh2');

module.exports = function(grunt) {
  var optionUtils = require('./lib/option-utils').init(grunt);
  var operations = require('./lib/operations').init(grunt);

  grunt.registerTask('remoteLockCreate', 'Create a remote lockfile.', function() {
    var done = this.async();

    var options = optionUtils.merge(grunt.config.get('remoteLockCreate'),
                                    this.args[0]);

    if (!options) {
      done(false);
      return;
    }

    operations.create(options, done);
  });
};
