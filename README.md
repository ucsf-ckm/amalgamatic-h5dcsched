[![Build Status](https://travis-ci.org/ucsf-ckm/amalgamatic-h5dcsched.svg?branch=master)](https://travis-ci.org/ucsf-ckm/amalgamatic-h5dcsched)

amalgamatic-h5dcsched
======================

[Amalgamatic](https://github.com/ucsf-ckm/amalgamatic) plugin for the [HTML5DevConf Schedule](http://html5devconf.com/schedule.html)

## Installation

Install amalgamatic and this plugin via `npm`:

`npm install amalgamatic amalgamatic-h5dcsched`

## Usage

````
var amalgamatic = require('amalgamatic'),
    sched = require('amalgamatic-h5dcsched');

// Add this plugin to your Amalgamatic instance along with any other plugins you've configured.
amalgamatic.add('sched', sched);

//Use it!
var callback = function (err, results) {
    if (err) {
        console.dir(err);
    } else {
        results.forEach(function (result) {
            console.log(result.name);
            console.dir(result.data);
        });
    }
};

amalgamatic.search({}, callback);
````
