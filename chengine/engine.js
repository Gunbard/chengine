/**************************************
 Engine
 Main engine logic. Game is in context
 at this point.
 **************************************/

chengine = {};
 
//TEST_AREA = 'model/battlefield/battlefield.dae';
//TEST_AREA = 'model/castle/castle.dae';
//TEST_AREA = 'model/ground/ground.dae';
//TEST_AREA = 'ground.dae';
//COLLADA_TEST = 'model/testblock.dae'
TEXTURE_SKYDOME = 'skydome.jpg';
 
// Mouse coordinates adjusted for canvas position in the page
mouseX = 0;
mouseY = 0;
 
/**
 Preloads all assets before starting the game
 */
chengine.preloadGameAssets = function ()
{
    game.preload
    (
        MODEL_PATH, 
        MODEL_REI_PATH, 
        MOTION_PATH, 
        MOTION_JUMP_PATH, 
        'images/tex.jpg',  
        'images/grass.gif', 
        'images/tex.png',
        'images/soccerball.png', 
        'sounds/tielaser.wav', 
        'sounds/explode.wav', 
        'images/cockpit.png',
        'images/crosshairs.png',
        MOTION_TEST,
        TEXTURE_SKYDOME,
        //TEST_AREA,
        'images/apad.png',
        'images/pad.png',
        'images/icon0.png',
        'images/font0.png'
        //COLLADA_TEST
    );
};
  
/**
 Initializes the game. Immediately called once enchant is finished initializing.
 */
chengine.gameInit = function ()
{    
    //chengine.changeScene3D(null, testScene);
    
    var mainScene3D = new objScene();
    enchant.Core.instance.GL.currentScene3D = mainScene3D;
    scene = mainScene3D;
    chengine.changeRoom(null, testRoom);
};