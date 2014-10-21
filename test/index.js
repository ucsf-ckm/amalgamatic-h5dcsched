/*jshint expr: true*/

var rewire = require('rewire');
var sched = rewire('../index.js');

var nock = require('nock');

var Lab = require('lab');
var lab = exports.lab = Lab.script();

var expect = Lab.expect;
var describe = lab.experiment;
var it = lab.test;

var beforeEach = lab.beforeEach;

var revert;

describe('search()', function () {

	beforeEach(function (done) {
		if (revert) {
			revert();
			revert = null;
		}

		nock.cleanAll();
		nock.disableNetConnect();
		done();
	});

	it('should return results as expected', function (done) {
		nock('http://html5devconf.com')
			.get('/schedule.html')
			.replyWithFile(200, __dirname + '/fixtures/schedule.html');

		sched.search({}, function (err, result) {

			console.dir(result.data[134]);

			expect(result.data).to.contain({
				url: 'http://html5devconf.com/speakers/rich_trott.html#session', 
				name: 'Curing Cancer With HTML5',
				speakers: ['Rich Trott, UC San Francisco'],
				room: 'E-131',
				start: '2014-10-21T17:00:00-07:00',
				end: '2014-10-21T17:20:00-07:00'
			});

			done();
		});
	});

	it('returns an error object if there was an HTTP error', function (done) {
		sched.search({}, function (err, result) {
			expect(result).to.be.not.ok;
			expect(err.message).to.equal('Nock: Not allow net connect for "html5devconf.com:80"');
			done();
		});
	});

	it('should return a link to the original schedule', function (done) {
		nock('http://html5devconf.com')
			.get('/schedule.html')
			.replyWithFile(200, __dirname + '/fixtures/schedule.html');

		sched.search({}, function (err, result) {
			expect(err).to.be.not.ok;
			expect(result.url).to.equal('http://html5devconf.com/schedule.html');
			done();
		});
	});

	it('should set withCredentials to false', function (done) {
		revert = sched.__set__({http: {get: function (options) {
			expect(options.withCredentials).to.be.false;
			done();
			return {on: function () {}};
		}}});

		sched.search();
	});

	it('should omit entries with no name', function (done) {
		nock('http://html5devconf.com')
			.get('/schedule.html')
			.replyWithFile(200, __dirname + '/fixtures/schedule.html');

		sched.search({}, function (err, result) {
			var emptyResults = result.data.filter(function (value) {
				return value.name === '';
			});
			expect(emptyResults.length).to.equal(0);
			expect(result.data.length).to.equal(147);
			done();
		});
	});

	it('should allow alternate URL to be set with setOptions()', function (done) {
		nock('http://cors-anywhere.herokuapp.com')
			.get('/html5devconf.com/schedule.html')
			.replyWithFile(200, __dirname + '/fixtures/schedule.html');

		sched.setOptions({url: 'http://cors-anywhere.herokuapp.com/html5devconf.com/schedule.html'});
		sched.search({}, function (err, result) {
			expect(err).to.be.not.ok;
			expect(result).to.be.ok;
			sched.setOptions({url: 'http://html5devconf.com/schedule.html'});
			done();
		});
	});

	it('should handle no speakers', function (done) {
		nock('http://html5devconf.com')
			.get('/schedule.html')
			.replyWithFile(200, __dirname + '/fixtures/schedule.html');

		sched.search({}, function (err, result) {

			expect(result.data).to.contain({
					url: 'http://html5devconf.com/speakers.html', 
					name: 'Overflow',
					speakers: [],
					room: 'E-133',
					start: '2014-10-20T09:00:00-07:00',
					end: '2014-10-20T09:20:00-07:00'
			});

			done();
		});
	});

	it('should handle multiple speakers', function (done) {
		nock('http://html5devconf.com')
			.get('/schedule.html')
			.replyWithFile(200, __dirname + '/fixtures/schedule.html');

		sched.search({}, function (err, result) {

			expect(result.data).to.contain({
					url: 'http://html5devconf.com/speakers/vlad_vukicevic.html#session', 
					name: 'Virtual Reality & The Future of the Web (50min, Part 1)',
					speakers: ['Vlad Vukicevic, Mozilla', 'Josh Carpenter , Mozilla'],
					room: 'E-135',
					start: '2014-10-20T11:40:00-07:00',
					end: '2014-10-20T12:00:00-07:00'
			});

			done();
		});
	});
});
