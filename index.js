var cheerio = require('cheerio');
var http = require('http');
var url = require('url');
var moment = require('moment');

var options = {
    url: 'http://html5devconf.com/schedule.html'
};

exports.search = function (query, callback) {
    'use strict';

    var myOptions = url.parse(options.url);
    myOptions.withCredentials = false;

    http.get(myOptions, function (res) {
        var rawData = '';

        res.on('data', function (chunk) {
            rawData += chunk;
        });

        res.on('end', function () {
            var $ = cheerio.load(rawData);
            var result = [];

            var rawResults = $('.sched-sess');

            rawResults.each(function () {
                var thisMess = $(this).children('li');

                var name = thisMess.first().text();
                if (! name) {
                    return;
                }
                var urlPath = thisMess.first().children('a').first().attr('href') || '';

                var date = $(this).parent().children().first().text();
                date = date.substring(date.indexOf(' ')+1);

                var times = $(this).parent().parent().children().first().text();
                var startTime = times.substring(0,times.indexOf(' '));
                var endTime = times.substring(times.indexOf('-')+2);
                var start = moment(date + ' ' + startTime + ' -0700', 'MMMM DD hh:mma ZZ').format();
                var end = moment(date + ' ' + endTime + ' -0700', 'MMMM DD hh:mma ZZ').format();

                result.push({
                    name: name,
                    url: url.resolve(options.url, urlPath),
                    speaker: thisMess.eq(1).text().substring(9),
                    room: thisMess.eq(2).text().substring(6),
                    start: start,
                    end: end
                });
            });
            
            callback(null, {
                data: result, 
                url: options.url
            });
        });
    }).on('error', function (e) {
        callback(e);
    });
};