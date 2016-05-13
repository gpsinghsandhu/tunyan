#!/usr/bin/env node

'use strict';

var fs = require('fs'),
    split = require('split'),
    minimist = require('minimist'),
    assert = require('assert'),
    path = require('path'),
    formatter;

var formatterArg = minimist(process.argv.slice(2))._[0],
    formatterFilePath;

assert(typeof formatterArg === 'string' &&
    formatterArg.length > 0,
    'formatter file not provided');

formatterFilePath = path.resolve(formatterArg);

// intentionally leaving this unsafe to fail
formatter = require(formatterFilePath);

assert(typeof formatter === 'function', 'provided formatter file doesnot export a function');

var entries = split('\n', function(input) {
    if (!input) {
        return undefined; } // don't emit on trailing or keep alive new lines
    var res;
    try {
        res = JSON.parse(input);
        if (typeof res === 'object') {
            res = formatter(res);
        }
        res = JSON.stringify(res);
    } catch (e) {
        res = input;
    }
    return res + '\n';
});

process.stdin
    .pipe(entries)
    .pipe(process.stdout);
