/**************************************
 Engine
 Main engine logic. Game is in context
 at this point.
 **************************************/

chengine = {};
  
// Mouse coordinates adjusted for canvas position in the page
mouseX = 0;
mouseY = 0;
  
/**
 Initializes the game. Immediately called once enchant is finished initializing.
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
    
    chengine.changeRoom(null, firstRoom);
};