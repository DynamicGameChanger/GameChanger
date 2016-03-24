// var casper = require('casper').create();

casper.test.begin('tests for front end', function(test) {
  casper.start('http://localhost:3000')
  casper.then(function() {
    test.assertTitle('Vicissitutor Home', 'Title of home page')
  })
  casper.then(function() {
    this.fill('form#form', {
      'username': 'josh',
      'password': 'josh'
    }, true)
  })
  casper.then(function() {
    this.mouse.click('#submit');
  })
  casper.then(function() {
    // var url = this.getCurrentURL();
    test.assertTitle('Game Controller', 'Title of controller pag');
    test.assertEquals(this.getCurrentUrl(), 'http://localhost:3000/controller?id=56f1ec343426cca50835f42c')
  })
  casper.run(function() {
    test.done();
  });
  casper.on('run.complete', function() {
    this.echo('Test completed');
    this.exit();
    this.bypass(999)
  });
})
