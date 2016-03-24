// var variables = require('./')
 var qs = '/' + window.location.search.slice(window.location.search.indexOf('?') + 4);
var socket = io(qs);
// console.log(qs)
// var socket = io(qs);
var thatHead;

//alows for dynamic changing of speed
socket.on('changeVariable', function(e) {
  var border = parseInt(localStorage.getItem('gridSize'));
  //
  //   if(border < thatHead.node.position().left + (thatHead.size*2) || border < thatHead.node.position().top + (thatHead.size*2) || border < thatHead.apple.node.position().left + (thatHead.size*2) || border < thatHead.apple.node.position().top + (thatHead.size*2) ) {
  //   thatHead.isPaused = true;
  //   thatHead.borderSmall = true;
  //   localStorage.setItem(e[0], e[2]);
  //   thatHead[e[0]] = e[2];
  //
  // } else {

    // thatHead.borderSmall = false;
    localStorage.setItem(e[0], e[1]);
    thatHead[e[0]] = e[1];
    thatHead.currentGame();
  // }
});



//head is defaulted to these settings at first start of game
function Head($el, size) {
  this.currentGame = function () {
    var scale = localStorage.getItem('scale') || 1;
    var snakeSize = localStorage.getItem('snakeSize') || 0.5;
    var gridSize = localStorage.getItem('gridSize') || 500;
    var sizeOfConstant = 50;

    $('#board').css({
      'height': (gridSize - 1 + (snakeSize * sizeOfConstant) - (gridSize % (snakeSize * sizeOfConstant))) * scale,
      'width': (gridSize - 1 + (snakeSize * sizeOfConstant) - (gridSize % (snakeSize * sizeOfConstant))) * scale
    });

    //allows for dynamic scaling and grid size on start of new game
    $('#gameBoard').width(gridSize * scale + 20);
    $('#gameBoard').height(gridSize * scale + 20);
    this.size = sizeOfConstant * snakeSize * scale;
    this.apple.node.css({
      'height': this.size,
      'width': this.size
    });

    $('.body').css({
      'height': this.size,
      'width': this.size
    });

    this.elGrid = $el.height() / this.size;
    this.node.css({
      'height': this.size,
      'width': this.size
    });

    for(var node = this; node; node = node.next) {
      node.render();
    }
    this.apple.render();
  };

  this.node = $('<div id="head"></div>');
  thatHead = this;
  this.borderSmall = false;
  this.snakeSize = localStorage.getItem('snakeSize');
  this.gridSize = localStorage.getItem('gridSize');
  this.scale = localStorage.getItem('scale');
  this.currentDirection = 'right';
  this.speed = localStorage.getItem('speed') || 200;
  $el.append(this.node);
  this.x = 0;
  this.y = 0;
  this.next = null;
  this.tail = this;
  this.elGrid = $el.height() / this.size;
  var elPos = $el.position();
  this.elPosX = elPos.left;
  this.elPosY = elPos.top;
  this.isPaused = false;
  this.render();
  setTimeout(this.move.bind(this), 500 - thatHead.speed);

}

Head.prototype.move = function() {
  if(!this.isPaused && !this.borderSmall){
    var direction = this.currentDirection;
    var position = this.position;

    this.currentGame();
    this.moveBody(this.x, this.y);
    this.moveHead(direction);

    if (this.checkBorder()) {

      this.checkBody();
      this.checkApple();
      this.render();

      var dist = Math.sqrt(Math.pow((this.x - this.apple.x), 2) + Math.pow((this.y - this.apple.y), 2));
      var chartData = {
        'Distance': dist,
        'Moves': this.counter
      };
      console.log('chartData: ', chartData);
      socket.emit('chartData', chartData);


      setTimeout(this.move.bind(this), 500 - this.speed);
    } else {
      this.die();
    }
  }
};

//checks to see if snake is hitting itself
Head.prototype.checkBody = function() {
  var head_x = this.x;
  var head_y = this.y;

  for (var node = this.next; node; node = node.next) {
    if (head_x === node.x && head_y === node.y) this.die();
  }
};

Head.prototype.die = function() {
  $('#board').empty();
  delete this.node;
  this.startGame();
};

Head.prototype.checkBorder = function() {
  if (this.x > this.elGrid || this.x < 0 || this.y > this.elGrid || this.y < 0) return false;
  else return true;
};

Head.prototype.addBody = function() {
  var bodyPart = new Body($('#board'), this.x, this.y, this.size);
  this.tail.next = bodyPart;
  this.tail = this.tail.next;
};

Head.prototype.checkApple = function() {
  if (this.apple.x === this.x && this.apple.y === this.y) {
    this.apple.eat();
    this.counter = 0;
    this.apple = new Apple($('#board'), this.size);
    this.addBody();
  }
};

Head.prototype.moveBody = function(x, y) {
  for (var node = this; node; node = node.next) {
    var temp_x, temp_y;
    temp_x = node.x;
    temp_y = node.y;
    node.x = x;
    node.y = y;
    x = temp_x;
    y = temp_y;
    node.render();
  }
};


Head.prototype.render = function() {
  this.node.offset({
    top: (this.size * this.y) + this.elPosY,
    left: (this.size * this.x) + this.elPosX
  });
};


Head.prototype.moveHead = function(direction) {

  if (direction === 'right') this.x++;
  if (direction === 'left') this.x--;
  if (direction === 'up') this.y--;
  if (direction === 'down') this.y++;
};
