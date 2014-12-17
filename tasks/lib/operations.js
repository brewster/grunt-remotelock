/*
 * grunt-ssh (partial)
 * https://github.com/andrewrjones/grunt-ssh
 *
 * Copyright (c) 2013 Andrew Jones
 * Licensed under the MIT license.
 */

var moment = require('moment');
var Connection = require('ssh2');

exports.init = function (grunt) {
  'use strict';

  var utilLib = require('./util').init(grunt);
  var ssh = require('./ssh').init(grunt);

  var exports = {};

  var check = exports.check = function (options, done) {
    grunt.log.writeln('Checking for lockfiles');
    ssh.remoteExec('cat ' + options.file + '; true', options, function (out) {
      if (out.stdout.match(/Deploys locked by/)) {
        grunt.log.warn(out.stdout);
        grunt.fail.fatal('Deploys are locked on this machine');
        done(false);
        return;
      } else {
        grunt.verbose.writeln('No lockfile / ignorable content');
        done(true);
      }
    });
  }

  var create = exports.create = function (options, done) {
    check(options, function (success) {
      if (success === false) {
        done(false);
        return;
      }

      grunt.log.writeln('Creating deploy lockfile');

      var msg = options.message;
      var timestamp = moment().format('MM/DD/YYYY HH:mm:ss ZZ');
      var lock_message = 'Deploys locked by ' + process.env.USER + ' at ' + timestamp + ': ' + msg;

      writeFile();

      function writeFile() {
        ssh.remoteExec('echo "' + lock_message + '" > ' + options.file, options, chmod);
      }

      function chmod() {
        ssh.remoteExec('chmod ' + options.mode + ' ' + options.file, options, chgrp);
      }

      function chgrp() {
        ssh.remoteExec('chgrp ' + options.grp + ' ' + options.file, options, function () {
          done();
        });
      }
    });
  }

  var remove = exports.remove = function (options, done) {
    grunt.log.writeln('Removing deploy lockfile');
    ssh.remoteExec('rm -f ' + options.file + '; true', options, function (out) {
      done(true);
    });
  }

  return exports;
};
