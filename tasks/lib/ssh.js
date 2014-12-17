/*
 * grunt-ssh (partial)
 * https://github.com/andrewrjones/grunt-ssh
 *
 * Copyright (c) 2013 Andrew Jones
 * Licensed under the MIT license.
 */

var Connection = require('ssh2');

exports.init = function (grunt) {
  'use strict';

  var utilLib = require('./util').init(grunt);

  var exports = {};

  exports.remoteExec = function (commands, options, done) {
    var output = {
      stdout: [],
      stderr: []
    };

    commands = utilLib.validateStringArrayAndProcess('command', commands);

    var c = new Connection();

    c.on('connect', function () {
      grunt.verbose.writeln('Connection :: connect');
    });
    c.on('ready', function () {
      grunt.verbose.writeln('Connection :: ready');
      execCommand();
    });
    c.on('error', function (err) {
      grunt.fail.warn('Connection :: error :: ' + err);
    });
    c.on('debug', function (message) {
      grunt.log.debug('Connection :: debug :: ' + message);
    });
    c.on('end', function () {
      grunt.verbose.writeln('Connection :: end');
    });
    c.on('close', function (had_error) {
      grunt.verbose.writeln('Connection :: close');
      grunt.verbose.writeln('finishing task');
      done({
        stdout: output.stdout.join(''),
        stderr: output.stderr.join('')
      });
    });

    var connectionOptions = utilLib.parseConnectionOptions(options);
    c.connect(connectionOptions);

    function execCommand() {
      if (commands.length === 0) {
        c.end();
      } else {
        var command = commands.shift();
        grunt.verbose.writeln('Executing :: ' + command);
        c.exec(command, options, function (err, stream) {
          if (err) {
            throw err;
          }
          stream.on('data', function (data, extended) {
            var out = String(data);
            if (extended === 'stderr') {
              output.stderr.push(data);
              if (!options.suppressRemoteErrors) {
                grunt.log.warn(out);
              }
              else {
                grunt.verbose.warn(out);
              }
            } else {
              output.stdout.push(data);
            //   grunt.log.write(out);
            }
            // output.push(out);
          });
          stream.on('end', function () {
            grunt.verbose.writeln('Stream :: EOF');
          });
          stream.on('close', function () {
            grunt.verbose.writeln('Stream :: close');
          });
          stream.on('exit', function (code, signal) {
            grunt.verbose.writeln('Stream :: exit :: code: ' + code + ', signal: ' + signal);
            if (!options.ignoreErrors && code !== 0) {
              grunt.fail.warn('Error executing task ' + command);
              c.end();
            } else {
              execCommand();
            }
          });
        });
      }
    }
  }

  return exports;
};
