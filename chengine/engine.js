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
    
    chengine.changeRoom(null, firstRoom);
};