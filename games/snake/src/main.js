const qs = '/' + window.location.search.slice(window.location.search.indexOf('?') + 4);
const socket = io(qs);

$(document).ready(() => {
  socket.on('changeGame', (e) => {
    localStorage.setItem('gameName', e);
    location.reload();
  });


  const startGame = () => {
    const scale = localStorage.getItem('scale') || 1;
    const snakeSize = localStorage.getItem('snakeSize') || 0.5;
    const gridSize = localStorage.getItem('gridSize') || 500;
    const sizeOfConstant = 50;

    $('#board').css({
      height: (gridSize - 1 + (snakeSize * sizeOfConstant) - (gridSize % (snakeSize * sizeOfConstant))) * scale,
      width: (gridSize - 1 + (snakeSize * sizeOfConstant) - (gridSize % (snakeSize * sizeOfConstant))) * scale,
      border: '1px solid black',
      position: 'absolute',
      top: '10px',
      left: '10px',
    });

    // allows for dynamic scaling and grid size on start of new game
    $('#gameBoard').width(gridSize * scale + 20);
    $('#gameBoard').height(gridSize * scale + 20);

    this.size = (sizeOfConstant * snakeSize * scale);
    head = new Head($('#board'), sizeOfConstant * snakeSize * scale);
    const apple = new Apple($('#board'), sizeOfConstant * snakeSize * scale);
    head.apple = apple;

    head.node.css({
      height: this.size,
      width: this.size,
      position: 'absolute',
      'background-color': 'green',
    });

    head.startGame = startGame;
    head.counter = 0;
  }

  startGame();


  $('body').on('keydown', (e) => {
    if (e.keyCode != 32) {

      if (e.keyCode === 37 && head.currentDirection !== 'right' && head.currentDirection !== 'left') {
        head.counter++;
        head.currentDirection = 'left';
      }
      if (e.keyCode === 39 && head.currentDirection !== 'left' && head.currentDirection !== 'right') {
        head.counter++;
        head.currentDirection = 'right';
      }
      if (e.keyCode === 40 && head.currentDirection !== 'up' && head.currentDirection !== 'down') {
        head.counter++;
        head.currentDirection = 'down';
      }
      if (e.keyCode === 38 && head.currentDirection !== 'down' && head.currentDirection !== 'up') {
        head.counter++;
        head.currentDirection = 'up';
      }
    } else {
      head.isPaused = !head.isPaused;
      head.move();
    }
  });

  window.addEventListener('load', () => {
    const swipedetect = (el) => {
      let touchsurface = el,
        swipedir,
        startX,
        startY,
        distX,
        distY,
        threshold = 75, // required min distance traveled to be considered swipe
        restraint = 200, // maximum distance allowed at the same time in perpendicular direction
        allowedTime = 300, // maximum time allowed to travel that distance
        elapsedTime,
        startTime;
        // handleswipe = callback || function(swipedir) {}

      document.addEventListener('touchstart', (e) => {
        const touchobj = e.changedTouches[0];
        swipedir = 'none';
        dist = 0;
        startX = touchobj.pageX;
        startY = touchobj.pageY;
        startTime = new Date().getTime(); // record time when finger first makes contact with surface
        e.preventDefault();
      }, false);

      document.addEventListener('touchmove', (e) => {
        e.preventDefault(); // prevent scrolling when inside DIV
      }, false);

      document.addEventListener('touchend', (e) => {

        const touchobj = e.changedTouches[0];
        const dirs = { left:'right',right:'left',down:'up',up:'down' };
        distX = touchobj.pageX - startX; // get horizontal dist traveled by finger while in contact with surface
        distY = touchobj.pageY - startY; // get vertical dist traveled by finger while in contact with surface
        elapsedTime = new Date().getTime() - startTime; // get time elapsed
        if (elapsedTime <= allowedTime) { // first condition for awipe met
          if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) { // 2nd condition for horizontal swipe met
            swipedir = (distX < 0) ? 'left' : 'right'; // if dist traveled is negative, it indicates left swipe
          } else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint) { // 2nd condition for vertical swipe met
            swipedir = (distY < 0) ? 'up' : 'down'; // if dist traveled is negative, it indicates up swipe
          }
        } else {
          head.isPaused = !head.isPaused;
          head.move();
        }
        if (head.currentDirection !== dirs[swipedir]) {
          head.counter++;
          head.currentDirection = swipedir;
        }
        // handleswipe(swipedir)
        e.preventDefault();
      }, false);
    };
    return swipedetect($('body'));
  }, false); // end window.onload
    // })
  // }


// draws pic and emits it
  const drawPic = () => {
    const board = document.getElementById('gameBoard');
    board.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
    const obj = {
      h: board.offsetHeight,
      w: board.offsetWidth,
      html: board.outerHTML.replace(/\n/g, ''),
    };
    socket.emit('image', obj);
  };

  setInterval(drawPic, 250);
});
