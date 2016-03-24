var qs = '/' + window.location.search.slice(window.location.search.indexOf('?') + 4);
var socket = io(qs);
$(document).ready(function() {
  var ctrlObj = {
    gameName: 'snake',
    controllers: {
      speed: {
        type: 'range',
        min: 50,
        max: 500,
        step: 10,
        value: 250
      },
      scale: {
        type: 'range',
        min: 0.5,
        max: 2,
        step: 0.1,
        value: 0.8
      },
      snakeSize: {
        type: 'range',
        min: 0.2,
        max: 1,
        step: 0.05,
        value: 0.5
      },
      gridSize: {
        type: 'range',
        min: 100,
        max: 1000,
        step: 100,
        value: 500
      },
      addApple: {
        type: 'button'
      }
    }
  };
  console.log('emit obj');
  socket.emit('obj', ctrlObj);

  function startGame() {
    var scale = localStorage.getItem('scale') || 1;
    var snakeSize = localStorage.getItem('snakeSize') || 0.5;
    var gridSize = localStorage.getItem('gridSize') || 500;
    const sizeOfConstant = 50;

    $('#board').css({
      'height': (gridSize - 1 + (snakeSize * sizeOfConstant) - (gridSize % (snakeSize * sizeOfConstant))) * scale,
      'width': (gridSize - 1 + (snakeSize * sizeOfConstant) - (gridSize % (snakeSize * sizeOfConstant))) * scale,
      'border': '1px solid black',
      'position': 'absolute',
      'top': '10px',
      'left': '10px'
    });

    //allows for dynamic scaling and grid size on start of new game
    $('#gameBoard').width(gridSize * scale + 20);
    $('#gameBoard').height(gridSize * scale + 20);

    this.size = (sizeOfConstant * snakeSize * scale);
    head = new Head($('#board'), sizeOfConstant * snakeSize * scale);
    var apple = new Apple($('#board'), sizeOfConstant * snakeSize * scale);
    head.apple = apple;

    head.node.css({
      'height': this.size,
      'width': this.size,
      'position': 'absolute',
      'background-color': 'green'
    });

    head.startGame = startGame;
    head.counter = 0;
  }

  startGame();

  // function currentGame() {
  //   var scale = localStorage.getItem('scale') || 1;
  //   var snakeSize = localStorage.getItem('snakeSize') || 0.5;
  //   var gridSize = localStorage.getItem('gridSize') || 500;
  //   const size = 50;
  //   $('#board').css({
  //     'height': (gridSize - 1 + (snakeSize * size) - (gridSize % (snakeSize * size))) * scale,
  //     'width': (gridSize - 1 + (snakeSize * size) - (gridSize % (snakeSize * size))) * scale
  //   });
  //
  //   //allows for dynamic scaling and grid size on start of new game
  //   $('#gameBoard').width(gridSize * scale + 20);
  //   $('#gameBoard').height(gridSize * scale + 20);
  //   head.size = (size * snakeSize * scale);
  //   head.apple.size = (size * snakeSize * scale);
  //   // var apple = new Apple($('#board'), size * snakeSize * scale);
  //   // head.apple = apple;
  //   head.currentGame = currentGame;
  //   // head.counter = 0;
  // }

  $('body').on('keydown', function(e) {
    if (e.keyCode != 32) {

      if (e.keyCode === 37 && head.currentDirection !== 'right' && head.currentDirection !== 'left') {
        head.counter++;
        console.log('pressed left');
        head.currentDirection = 'left';
      }
      if (e.keyCode === 39 && head.currentDirection !== 'left' && head.currentDirection !== 'right') {
        head.counter++;
        console.log('pressed right');
        head.currentDirection = 'right';
      }
      if (e.keyCode === 40 && head.currentDirection !== 'up' && head.currentDirection !== 'down') {
        head.counter++;
        console.log('pressed down');
        head.currentDirection = 'down';
      }
      if (e.keyCode === 38 && head.currentDirection !== 'down' && head.currentDirection !== 'up') {
        head.counter++;
        console.log('pressed up');
        head.currentDirection = 'up';
        // head.moveHead('up')
      }
    } else {
      head.isPaused = !head.isPaused;
      head.move();
    }
  });

  // draws pic and emits it
  function drawPic() {
    var board = document.getElementById('gameBoard')
    board.setAttribute("xmlns", "http://www.w3.org/1999/xhtml")
    var obj = {
      'h': board.offsetHeight,
      'w': board.offsetWidth,
      'html': board.outerHTML.replace(/\n/g,'')
    }
    socket.emit('image', obj);

  }

  setInterval(drawPic, 250);

});
