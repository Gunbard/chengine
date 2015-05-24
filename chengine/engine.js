/**************************************
 Engine
 Main engine logic. Game is in context
 at this point.
 **************************************/

chengine = {};

// CONSTANTS  
GAME_WIDTH = 640;
GAME_HEIGHT = 360;
GAME_FPS = 60;

// Fonts
DEFAULT_MSGTEXT_SIZE = 14;
DEFAULT_MSGTEXT_FONT = DEFAULT_MSGTEXT_SIZE.toString() + 'pt Verdana';
DEFAULT_MSGTEXT_COLOR = 'white';

// Cardinal directions
DIRECTION_NORTH = 180;
DIRECTION_SOUTH = 0;
DIRECTION_EAST = 270;
DIRECTION_WEST = 90;
  
// Mouse coordinates adjusted for canvas position in the page
mouseX = 0;
mouseY = 0;

/**
 Resizes the game to fit the window while keeping the correct aspect ratio
 */
function resizeGame() 
{
    var gameArea = document.getElementById('enchant-stage');
    var widthToHeight = 16 / 9;
    var newWidth = window.innerWidth;
    var newHeight = window.innerHeight;
    var newWidthToHeight = newWidth / newHeight;
    
    if (newWidthToHeight > widthToHeight) {
        newWidth = newHeight * widthToHeight;
        gameArea.style.height = newHeight + 'px';
        gameArea.style.width = newWidth + 'px';
    } else {
        newHeight = newWidth / widthToHeight;
        gameArea.style.width = newWidth + 'px';
        gameArea.style.height = newHeight + 'px';
    }
    
    var gameCanvasContainer = document.getElementById('3d-stage');
    gameCanvasContainer.style.width = gameArea.style.width;
    gameCanvasContainer.style.height = gameArea.style.height;
    
    var gameCanvas = gameCanvasContainer.getElementsByTagName('canvas')[0];
    var style = gameCanvas.getAttribute('style') || '';

    var scale = {x: 1, y: 1};
    scale.x = newWidth / gameCanvas.width;
    scale.y = newHeight / gameCanvas.height;
    
    if (scale.x < scale.y) {
        scaleString = scale.x + ', ' + scale.x;
    } else {
        scaleString = scale.y + ', ' + scale.y;
    }
    
    gameCanvas.setAttribute('style', style + ' ' + '-ms-transform-origin: left top; -webkit-transform-origin: left top; -moz-transform-origin: left top; -o-transform-origin: left top; transform-origin: left top; -ms-transform: scale(' + scaleString + '); -webkit-transform: scale3d(' + scaleString + ', 1); -moz-transform: scale(' + scaleString + '); -o-transform: scale(' + scaleString + '); transform: scale(' + scaleString + ');');
    
    enchant.Core.instance.scale = scale.x;
}

window.addEventListener('resize', resizeGame, false);
window.addEventListener('orientationchange', resizeGame, false);
  
/**
 Initializes the game. Immediately called once enchant is finished initializing.
 @param firstRoom {objRoom} The initial room to go to
 */
chengine.gameInit = function (firstRoom)
{    
    // Enable alpha blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    // Bind keys
    chengine.input.setKeybindings();
    
    var mainScene3D = new objScene();
    enchant.Core.instance.GL.currentScene3D = mainScene3D;
    scene = mainScene3D;
    chengine.scene = mainScene3D;
    
    chengine.changeRoom(firstRoom);
};