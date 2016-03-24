const Browser = require('zombie');

// You may use whatever assertion library you would like.
const expect = require('expect');
// const expect = require('chai').expect;
// const assert = require('chai').assert;

const PORT = process.env.PORT || 3000;
var server = require('../server');


// Browser.localhost('http://localhost:3000/login', 3000);
describe('User visits Home Page', function() {

  const browser = new Browser();

  before(function(done) {
    return browser.visit('http://localhost:3000', done);
  });

  describe('user submits form', function() {

    before(function(done) {
      return browser
        .fill('#username', 'josh')
        .fill('#password', 'josh')
        .fire('#submit', 'click', done)
    });

    it('should be successful', function() {
      return browser.assert.success();
    });

    it('should see controller page', function() {
      return browser.assert.text('title', 'Game Controller');
    });

    it('should have correct qs', function() {
      var value = browser.getCookie('SSID');
      return expect(value).toEqual('56f1ec343426cca50835f42c');
    });
  })
});

describe('User visits Snake Page', function() {

  const browser = new Browser();

  before(function(done) {
    return browser.visit('http://localhost:3000/snake', done);
  });

  describe('user submits form', function() {
    it('goes to snake', function() {
      browser.assert.text('title', 'Snake')
    })
  });
});
